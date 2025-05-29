import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, LivroBackend, mapExternalBookToInternal } from '../constants/Api';
import { BookItem } from '../app/BooksApiService';

interface BackendServiceResult {
  livrosFromBackend: any[];
  isLoading: boolean;
  error: string | null;
  fetchAllBooks: () => Promise<any[]>;
  fetchBookById: (id: number) => Promise<any | null>;
  convertBackendBookToGoogleFormat: (backendBook: LivroBackend) => BookItem;
  searchBooks: (term: string) => Promise<any[]>;
}

// Adaptador para converter formato do backend para o formato Google Books usado pelo app
const convertBackendBookToGoogleFormat = (backendBook: LivroBackend): BookItem => {
  return {
    id: backendBook.id.toString(),
    volumeInfo: {
      title: backendBook.titulo,
      authors: backendBook.autor ? [backendBook.autor] : undefined,
      description: backendBook.descricao,
      imageLinks: {
        thumbnail: backendBook.capa,
        smallThumbnail: backendBook.capa
      },
      publishedDate: backendBook.dataPublicacao,
      categories: backendBook.genero ? [backendBook.genero] : undefined
    }
  };
};

// Hook para integração com o backend Spring Boot
const useBackendService = (): BackendServiceResult => {
  const [livrosFromBackend, setLivrosFromBackend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todos os livros do backend
  const fetchAllBooks = async (): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<LivroBackend[]>(`${API_BASE_URL}/livros`);
      
      // Converter para o formato Google Books usado pelo frontend
      const booksInGoogleFormat = response.data.map(convertBackendBookToGoogleFormat);
      
      // Guardar no estado e no cache local
      setLivrosFromBackend(booksInGoogleFormat);
      await AsyncStorage.setItem('backend_books_cache', JSON.stringify(booksInGoogleFormat));
      
      return booksInGoogleFormat;
    } catch (err) {
      console.error('Erro ao buscar livros do backend:', err);
      setError('Não foi possível conectar ao backend. Usando dados em cache.');
      
      // Implementando sistema de fallback conforme memória do projeto
      try {
        const cachedBooks = await AsyncStorage.getItem('backend_books_cache');
        if (cachedBooks) {
          const parsedBooks = JSON.parse(cachedBooks);
          setLivrosFromBackend(parsedBooks);
          return parsedBooks;
        }
        return [];
      } catch (cacheErr) {
        console.error('Erro ao acessar cache:', cacheErr);
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar livro por ID
  const fetchBookById = async (id: number): Promise<any | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<LivroBackend>(`${API_BASE_URL}/livros/${id}`);
      const bookInGoogleFormat = convertBackendBookToGoogleFormat(response.data);
      return bookInGoogleFormat;
    } catch (err) {
      console.error(`Erro ao buscar livro ID ${id} do backend:`, err);
      
      // Sistema de fallback em camadas conforme memória do projeto
      try {
        // 1. Tenta encontrar no cache local
        const cachedBooks = await AsyncStorage.getItem('backend_books_cache');
        if (cachedBooks) {
          const parsedBooks = JSON.parse(cachedBooks);
          const foundBook = parsedBooks.find((book: BookItem) => book.id === id.toString());
          if (foundBook) return foundBook;
        }
        
        // 2. Tenta encontrar nos dados mockados da categoria relacionada
        // (Simplificado, pois o sistema mockado está no BooksApiService)
        return null;
      } catch (cacheErr) {
        console.error('Erro ao buscar no cache:', cacheErr);
        return null;
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Buscar livros por termo de pesquisa
  const searchBooks = async (term: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Aqui podemos melhorar usando um endpoint específico de busca
      // Por enquanto, vamos buscar todos e filtrar no cliente
      const allBooks = await fetchAllBooks();
      const lowercaseTerm = term.toLowerCase();
      
      return allBooks.filter((book: BookItem) => {
        const title = book.volumeInfo.title?.toLowerCase() || '';
        const authors = book.volumeInfo.authors?.join(' ').toLowerCase() || '';
        const categories = book.volumeInfo.categories?.join(' ').toLowerCase() || '';
        
        return title.includes(lowercaseTerm) || 
               authors.includes(lowercaseTerm) || 
               categories.includes(lowercaseTerm);
      });
    } catch (err) {
      console.error('Erro na busca de livros:', err);
      setError('Falha na busca. Tente novamente.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    livrosFromBackend,
    isLoading,
    error,
    fetchAllBooks,
    fetchBookById,
    convertBackendBookToGoogleFormat,
    searchBooks
  };
};

export default useBackendService;
