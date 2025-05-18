// Verifica se o código está rodando no lado do cliente (navegador) e não no servidor.
// Isso é importante porque 'window' só existe no navegador.
const isClient = typeof window !== 'undefined';

// Função para obter um valor do sessionStorage.
// Parâmetros:
//   key: a chave do item a ser buscado.
//   initialValue: valor padrão caso não exista nada salvo.
// Se não estiver no cliente, retorna o valor padrão.
// Caso contrário, tenta buscar o valor salvo no sessionStorage.
// Se encontrar, faz o parse do JSON e retorna o valor original.
// Se não encontrar, retorna o valor padrão.
export const getSessionStorage = (key, initialValue) => {
    if (!isClient) return initialValue;

    const stored = sessionStorage.getItem(key);

    return stored ? JSON.parse(stored) : initialValue;
};

// Função para salvar um valor no sessionStorage.
// Parâmetros:
//   key: a chave onde o valor será salvo.
//   value: o valor a ser salvo.
// Só executa se estiver no cliente.
// Converte o valor para string usando JSON.stringify antes de salvar.
export const setSessionStorage = (key, value) => {
    if (isClient) {
        sessionStorage.setItem(key, JSON.stringify(value))
    }
};