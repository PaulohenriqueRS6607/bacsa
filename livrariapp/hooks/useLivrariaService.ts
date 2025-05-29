import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, LivroBackend, mapExternalBookToInternal } from '../constants/Api';

export interface Book {
  id: string | number;
  title: string;
  author?: string;
  cover?: string;
  description: string;
  status: 'available' | 'withdrawal' | 'rented';
  category?: string;
  genre?: string;
  publishedDate?: string;
  price?: number;
  dueDate?: string;
  rentalDate?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
}

interface LivrariaServiceResult {
  books: Book[];
  myBooks: Book[];
  loading: boolean;
  error: string | null;
  fetchBooks: (query?: string, category?: string, useLocalApi?: boolean) => Promise<void>;
  fetchBookById: (id: number) => Promise<Book | null>;
  addBook: (book: Omit<LivroBackend, 'id'>) => Promise<Book | null>;
  updateBook: (id: number, book: Partial<LivroBackend>) => Promise<Book | null>;
  deleteBook: (id: number) => Promise<boolean>;
  rentBook: (book: Book) => void;
  returnBook: (book: Book) => void;
  cancelReservation: (book: Book) => void;
  searchBooks: (query: string) => Promise<Book[]>;
}

export function useLivrariaService(): LivrariaServiceResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from either local API or Google Books API
  const fetchBooks = useCallback(async (
    query?: string, 
    category?: string,
    useLocalApi: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      let result;

      if (useLocalApi) {
        // Use local backend API
        if (query) {
          // Search by title if query is provided
          result = await axios.get(API_ENDPOINTS.LIVROS.BUSCA_TITULO(query));
          const livros = result.data.map((livro: LivroBackend) => mapExternalBookToInternal(livro));
          setBooks(livros);
        } else {
          // Get all books if no query
          result = await axios.get(API_ENDPOINTS.LIVROS.BASE);
          const livros = result.data.map((livro: LivroBackend) => mapExternalBookToInternal(livro));
          setBooks(livros);
        }
      } else {
        // Fallback to Google Books API if local API isn't available or as requested
        const googleApiKey = 'AIzaSyBhxcAVrnA3YoF4bjRkWkLXSiFu12bjL3w';
        const activeQuery = category && category !== 'all' 
          ? `subject:${category}` 
          : 'subject:*';
        const fullQuery = query 
          ? `${activeQuery}+intitle:${query}` 
          : activeQuery;
        
        result = await axios.get('https://www.googleapis.com/books/v1/volumes', {
          params: { 
            q: fullQuery, 
            maxResults: 10,
            key: googleApiKey 
          },
        });
        
        if (result.data.items) {
          const processedBooks = result.data.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Autor Desconhecido',
            cover: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
            description: item.volumeInfo.description || 'Descrição não disponível',
            status: 'available',
            category: item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Geral',
            publishedDate: item.volumeInfo.publishedDate,
          }));
          
          setBooks(processedBooks);
        } else {
          setBooks([]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar livros:', err);
      setError('Falha ao carregar livros. Por favor, tente novamente.');
      setLoading(false);
      
      // Fallback to Google Books API if local API fails
      if (useLocalApi) {
        fetchBooks(query, category, false);
      }
    }
  }, []);
  
  // Fetch a specific book by ID
  const fetchBookById = useCallback(async (id: number): Promise<Book | null> => {
    try {
      setLoading(true);
      const result = await axios.get(API_ENDPOINTS.LIVROS.POR_ID(id));
      setLoading(false);
      return mapExternalBookToInternal(result.data);
    } catch (err) {
      console.error(`Erro ao buscar livro ID ${id}:`, err);
      setError(`Não foi possível encontrar o livro com ID ${id}.`);
      setLoading(false);
      return null;
    }
  }, []);
  
  // Add a new book to the backend
  const addBook = useCallback(async (book: Omit<LivroBackend, 'id'>): Promise<Book | null> => {
    try {
      setLoading(true);
      const result = await axios.post(API_ENDPOINTS.LIVROS.BASE, book);
      setLoading(false);
      const newBook = mapExternalBookToInternal(result.data);
      setBooks(prevBooks => [...prevBooks, newBook]);
      return newBook;
    } catch (err) {
      console.error('Erro ao adicionar livro:', err);
      setError('Não foi possível adicionar o livro. Por favor, tente novamente.');
      setLoading(false);
      return null;
    }
  }, []);
  
  // Update an existing book
  const updateBook = useCallback(async (id: number, book: Partial<LivroBackend>): Promise<Book | null> => {
    try {
      setLoading(true);
      const result = await axios.put(API_ENDPOINTS.LIVROS.POR_ID(id), book);
      setLoading(false);
      const updatedBook = mapExternalBookToInternal(result.data);
      setBooks(prevBooks => 
        prevBooks.map(b => b.id === updatedBook.id ? updatedBook : b)
      );
      return updatedBook;
    } catch (err) {
      console.error(`Erro ao atualizar livro ID ${id}:`, err);
      setError(`Não foi possível atualizar o livro com ID ${id}.`);
      setLoading(false);
      return null;
    }
  }, []);
  
  // Delete a book
  const deleteBook = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await axios.delete(API_ENDPOINTS.LIVROS.POR_ID(id));
      setLoading(false);
      setBooks(prevBooks => prevBooks.filter(b => b.id !== id));
      return true;
    } catch (err) {
      console.error(`Erro ao excluir livro ID ${id}:`, err);
      setError(`Não foi possível excluir o livro com ID ${id}.`);
      setLoading(false);
      return false;
    }
  }, []);
  
  // Rent a book (simulated - just updates local state)
  const rentBook = useCallback((book: Book) => {
    // Update books list to show book as rented
    setBooks(books.map(b => b.id === book.id ? { ...b, status: 'withdrawal' as const } : b));
    
    // Add to my books collection with rental date
    const rentedBook: Book = { 
      ...book, 
      status: 'withdrawal', 
      rentalDate: new Date().toISOString().split('T')[0]
    };
    setMyBooks(prevBooks => [...prevBooks, rentedBook]);
  }, [books]);
  
  // Return a book (simulated - just updates local state)
  const returnBook = useCallback((book: Book) => {
    // Update books list to show book as available
    setBooks(books.map(b => b.id === book.id ? { ...b, status: 'available' } : b));
    
    // Remove from my books
    setMyBooks(prevBooks => prevBooks.filter(b => b.id !== book.id));
  }, [books]);
  
  // Cancel a book reservation (simulated - just updates local state)
  const cancelReservation = useCallback((book: Book) => {
    // Update books in search results if present
    setBooks(books.map(b => b.id === book.id ? { ...b, status: 'available' } : b));
    
    // Remove from my books
    setMyBooks(prevBooks => prevBooks.filter(b => b.id !== book.id));
  }, [books]);

  // Search books by title, author, or genre
  const searchBooks = useCallback(async (query: string): Promise<Book[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to search on local backend first
      try {
        const result = await axios.get(API_ENDPOINTS.LIVROS.BUSCA_TITULO(query));
        const livros = result.data.map((livro: LivroBackend) => mapExternalBookToInternal(livro));
        setLoading(false);
        return livros;
      } catch (localError) {
        console.log('Falling back to Google Books API for search');
        
        // Fall back to Google Books API
        const googleApiKey = 'AIzaSyBhxcAVrnA3YoF4bjRkWkLXSiFu12bjL3w';
        const result = await axios.get('https://www.googleapis.com/books/v1/volumes', {
          params: { 
            q: query, 
            maxResults: 15,
            key: googleApiKey 
          },
        });
        
        if (result.data.items) {
          const processedBooks = result.data.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Autor Desconhecido',
            cover: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
            description: item.volumeInfo.description || 'Descrição não disponível',
            status: 'available',
            category: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'Geral',
            genre: item.volumeInfo.categories ? item.volumeInfo.categories.join(', ') : 'Geral',
            publishedDate: item.volumeInfo.publishedDate,
          }));
          
          setLoading(false);
          return processedBooks;
        }
        return [];
      }
    } catch (err) {
      console.error('Erro ao buscar livros:', err);
      setError('Falha ao pesquisar livros. Por favor, tente novamente.');
      setLoading(false);
      return [];
    }
  }, []);

  return {
    books,
    myBooks,
    loading,
    error,
    fetchBooks,
    fetchBookById,
    addBook,
    updateBook,
    deleteBook,
    rentBook,
    returnBook,
    cancelReservation,
    searchBooks,
  };
}
