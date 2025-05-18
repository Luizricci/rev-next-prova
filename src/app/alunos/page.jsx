"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Pagination, Modal, Card, Skeleton } from "antd";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { getSessionStorage, setSessionStorage}  from "../../utils/sessionStorage";
import styles from "./Alunos.module.css";
import dotenv from "dotenv";
dotenv.config();

const HEADERS = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY };

// Importação do React e hooks necessários

export default function Alunos() {
    // Estado principal para armazenar alunos, status de loading, página atual e tamanho da página
    const [data, setData] = useState({
        alunos: [],         // Lista de alunos
        loading: true,      // Indica se está carregando os dados
        current: 1,         // Página atual da paginação
        pageSize: 0,        // Quantidade de itens por página
    });

    // Estado para controlar o modal de avaliação do aluno
    const [modalInfo, setModalInfo] = useState({
        visible: false,     // Se o modal está visível
        aluno: null,        // Aluno selecionado
        avaliacao: null,    // Avaliação do aluno selecionado
        loading: false,     // Se está carregando a avaliação
    });

    // useEffect para buscar os alunos ao montar o componente
    useEffect(() => {
        const fetchAlunos = async () => {
            // Tenta buscar os alunos do sessionStorage para evitar requisições desnecessárias
            const cached = getSessionStorage("alunosData", []);
            if (cached.length > 0) {
                // Se houver cache, usa os dados do cache
                setData({ alunos: cached, loading: false, current: 1, pageSize: 5 });
                return;
            }

            try {
                // Busca os alunos da API
                const { data: alunos } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/estudantes`,
                    {
                        headers: HEADERS,
                    }
                );
                // Salva os alunos no sessionStorage para cache
                setSessionStorage("alunosData", alunos);
                // Atualiza o estado com os alunos recebidos
                setData({ alunos, loading: false, current: 1, pageSize: 5 });
            } catch {
                // Em caso de erro, exibe mensagem e para o loading
                toast.error("Erro ao carregar alunos");
                setData((d) => ({ ...d, loading: false }));
            }
        };

        fetchAlunos();
    }, []); // Executa apenas uma vez ao montar

    // Função para abrir o modal e buscar a avaliação do aluno selecionado
    const openModal = async (aluno) => {
        // Abre o modal e inicia o loading da avaliação
        setModalInfo({ visible: true, aluno, avaliacao: null, loading: true });

        // Tenta buscar a avaliação do aluno no sessionStorage
        const cacheKey = `avaliacao_${aluno.id}`;
        const cached = getSessionStorage(cacheKey, null);
        if (cached) {
            // Se houver cache, usa os dados do cache
            setModalInfo((m) => ({ ...m, avaliacao: cached, loading: false }));
            return;
        }

        try {
            // Busca a avaliação do aluno na API
            const { data: avaliacao } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/avaliacao/${aluno.id}`,
                {
                    headers: HEADERS,
                }
            );
            // Salva a avaliação no sessionStorage
            setSessionStorage(cacheKey, avaliacao);
            // Atualiza o estado do modal com a avaliação recebida
            setModalInfo((m) => ({ ...m, avaliacao, loading: false }));
        } catch {
            // Em caso de erro, exibe mensagem e para o loading
            toast.error("Erro ao carregar avaliação.");
            setModalInfo((m) => ({ ...m, loading: false }));
        }
    };

    // Função para retornar apenas os alunos da página atual (paginação)
    const paginatedAlunos = () => {
        const start = (data.current - 1) * data.pageSize; // Índice inicial
        return data.alunos.slice(start, start + data.pageSize); // Retorna o slice da lista
    };

    // Renderização do componente
    return (
        <div>
            <h1>Lista de Alunos</h1>

            {/* Componente de paginação, controla página atual e tamanho da página */}
            <Pagination
                current={data.current}
                pageSize={data.pageSize}
                total={data.alunos.length}
                onChange={(page, size) =>
                    setData((d) => ({ ...d, current: page, pageSize: size }))
                }
                showSizeChanger
                pageSizeOptions={["5", "10", "100"]}
            />

            {/* Se estiver carregando, mostra um loader, senão mostra os cards dos alunos */}
            {data.loading ? (
                <Image
                    src="/images/loader.gif"
                    width={300}
                    height={200}
                    alt="Loading"
                />
            ) : (
                <div className={styles.cardsContainer}>
                    {/* Mapeia os alunos da página atual e exibe um Card para cada um */}
                    {paginatedAlunos().map((aluno) => (
                        <Card
                            key={aluno.id}
                            className={styles.card}
                            hoverable
                            onClick={() => openModal(aluno)} // Ao clicar, abre o modal
                            cover={
                                <Image
                                    alt={aluno.name_estudante}
                                    src={aluno.photo ? aluno.photo : "/images/220.svg"}
                                    width={220}
                                    height={220}
                                />
                            }
                        >
                            <Card.Meta
                                title={aluno.name_estudante}
                            />
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal para exibir a avaliação do aluno selecionado */}
            <Modal
                title={`Avaliação de ${modalInfo.aluno?.name_estudante}`}
                open={modalInfo.visible}
                onCancel={() =>
                    setModalInfo({
                        visible: false,
                        aluno: null,
                        avaliacao: null,
                        loading: false,
                    })
                }
                onOk={() =>
                    setModalInfo({
                        visible: false,
                        aluno: null,
                        avaliacao: null,
                        loading: false,
                    })
                }
                width={600}
            >
                {/* Se estiver carregando a avaliação, mostra Skeleton, senão mostra os dados */}
                {modalInfo.loading ? (
                    <Skeleton active />
                ) : modalInfo.avaliacao ? (
                    <div className={styles.avaliacaoInfo}>
                        <p>
                            <span className={styles.label}>Nota:</span>{" "}
                            {modalInfo.avaliacao.nota}
                        </p>
                        <p>
                            <span className={styles.label}>Professor:</span>{" "}
                            {modalInfo.avaliacao.professor}
                        </p>
                        <p>
                            <span className={styles.label}>Matéria:</span>{" "}
                            {modalInfo.avaliacao.materia}
                        </p>
                        <p>
                            <span className={styles.label}>Sala:</span>{" "}
                            {modalInfo.avaliacao.sala}
                        </p>
                    </div>
                ) : (
                    <p style={{ textAlign: "center" }}>Avaliação não encontrada.</p>
                )}
            </Modal>

            {/* Componente para exibir notificações de erro */}
            <ToastContainer position="top-right" autoClose={4500} />
        </div>
    );
}