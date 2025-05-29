// Constantes para as URLs da API
export const API_BASE_URL = 'http://localhost:8080';

// Endpoints
export const API_ENDPOINTS = {
  LIVROS: {
    BASE: `${API_BASE_URL}/livros`,
    BUSCA_TITULO: (titulo: string) => `${API_BASE_URL}/livros/busca/titulo?titulo=${encodeURIComponent(titulo)}`,
    BUSCA_AUTOR: (autor: string) => `${API_BASE_URL}/livros/busca/autor?autor=${encodeURIComponent(autor)}`,
    BUSCA_GENERO: (genero: string) => `${API_BASE_URL}/livros/busca/genero?genero=${encodeURIComponent(genero)}`,
    POR_ID: (id: number) => `${API_BASE_URL}/livros/${id}`,
    STATUS: `${API_BASE_URL}/livros/status`,
  },
};

// Interface para o Livro do backend
export interface LivroBackend {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  capa: string;
  dataPublicacao: string;
  descricao: string;
}

// Tipos de status válidos para os livros
export type BookStatus = 'available' | 'withdrawal' | 'rented';

// Função para converter dados da API externa para nosso formato interno
export const mapExternalBookToInternal = (externalBook: any) => {
  return {
    id: externalBook.id,
    title: externalBook.titulo || externalBook.title,
    author: externalBook.autor || externalBook.author,
    cover: externalBook.capa || externalBook.cover,
    description: externalBook.descricao || externalBook.description || 'Sem descrição disponível',
    status: (externalBook.status || 'available') as BookStatus,
    category: externalBook.genero || externalBook.category || 'Geral',
    publishedDate: externalBook.dataPublicacao || externalBook.publishedDate,
    price: externalBook.preco,
    dueDate: externalBook.dueDate,
    rentalDate: externalBook.rentalDate,
    publisher: externalBook.publisher,
    pageCount: externalBook.pageCount,
    language: externalBook.language,
  };
};
