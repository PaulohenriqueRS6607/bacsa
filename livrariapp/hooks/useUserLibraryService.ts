import { useState, useEffect, useCallback } from 'react';
import { Book } from '../app/(tabs)/_layout';
import axios from 'axios';

// Solução temporária: usando um mock do AsyncStorage enquanto a dependência real não está disponível
const AsyncStorage = {
  getItem: async (key: string) => {
    try {
      // Em um ambiente de produção, aqui seria recuperado do armazenamento real
      console.log('Mock getItem', key);
      // Retorna alguns dados mock para facilitar o teste
      if (key === 'userFavorites') {
        return JSON.stringify([]);
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      console.log('Mock setItem', key, value);
      return;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw error;
    }
  },
  removeItem: async (key: string) => {
    try {
      console.log('Mock removeItem', key);
      return;
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      throw error;
    }
  },
  getAllKeys: async () => {
    try {
      console.log('Mock getAllKeys');
      return ['userFavorites'];
    } catch (error) {
      console.error('Erro ao recuperar chaves:', error);
      return [];
    }
  }
};

export interface SavedBook extends Book {
  savedAt: string;
  notes?: string;
}

export interface UserLibraryServiceResult {
  // Dados
  favorites: SavedBook[];
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Ações
  addToFavorites: (book: Book) => Promise<boolean>;
  removeFromFavorites: (bookId: string | number) => Promise<boolean>;
  updateBookNotes: (bookId: string | number, notes: string) => Promise<boolean>;
  searchInFavorites: (query: string) => Promise<SavedBook[]>;
  isBookInFavorites: (bookId: string | number) => boolean;
  clearFavorites: () => Promise<boolean>;
}

export function useUserLibraryService(userId?: string): UserLibraryServiceResult {
  const [favorites, setFavorites] = useState<SavedBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Chave usada para armazenar favoritos
  const storageKey = userId ? `userFavorites_${userId}` : 'userFavorites';

  // Carregar favoritos do armazenamento local
  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedFavorites = await AsyncStorage.getItem(storageKey);
      
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setError('Não foi possível carregar seus favoritos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Salvar favoritos no armazenamento local
  const saveFavorites = useCallback(async (updatedFavorites: SavedBook[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedFavorites));
      return true;
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
      setError('Não foi possível salvar suas alterações. Por favor, tente novamente.');
      return false;
    }
  }, [storageKey]);

  // Adicionar um livro aos favoritos
  const addToFavorites = useCallback(async (book: Book): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verificar se o livro já está nos favoritos
      if (favorites.some(fav => fav.id === book.id)) {
        return true; // Livro já está nos favoritos
      }
      
      // Adicionar o livro aos favoritos
      const savedBook: SavedBook = {
        ...book,
        savedAt: new Date().toISOString()
      };
      
      const updatedFavorites = [...favorites, savedBook];
      setFavorites(updatedFavorites);
      
      // Salvar no armazenamento local
      const success = await saveFavorites(updatedFavorites);
      return success;
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      setError('Não foi possível adicionar o livro aos favoritos. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [favorites, saveFavorites]);

  // Remover um livro dos favoritos
  const removeFromFavorites = useCallback(async (bookId: string | number): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Filtrar o livro a ser removido
      const updatedFavorites = favorites.filter(book => book.id !== bookId);
      
      // Verificar se algum livro foi removido
      if (updatedFavorites.length === favorites.length) {
        return false; // Nenhum livro foi removido
      }
      
      setFavorites(updatedFavorites);
      
      // Salvar no armazenamento local
      const success = await saveFavorites(updatedFavorites);
      return success;
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      setError('Não foi possível remover o livro dos favoritos. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [favorites, saveFavorites]);

  // Atualizar notas de um livro nos favoritos
  const updateBookNotes = useCallback(async (bookId: string | number, notes: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Encontrar o livro a ser atualizado
      const bookIndex = favorites.findIndex(book => book.id === bookId);
      
      if (bookIndex === -1) {
        return false; // Livro não encontrado
      }
      
      // Atualizar as notas do livro
      const updatedFavorites = [...favorites];
      updatedFavorites[bookIndex] = {
        ...updatedFavorites[bookIndex],
        notes
      };
      
      setFavorites(updatedFavorites);
      
      // Salvar no armazenamento local
      const success = await saveFavorites(updatedFavorites);
      return success;
    } catch (error) {
      console.error('Erro ao atualizar notas:', error);
      setError('Não foi possível atualizar as notas do livro. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [favorites, saveFavorites]);

  // Buscar nos favoritos
  const searchInFavorites = useCallback(async (query: string): Promise<SavedBook[]> => {
    try {
      if (!query.trim()) {
        return favorites;
      }
      
      const lowerQuery = query.toLowerCase();
      
      // Buscar por título, autor ou notas
      const results = favorites.filter(book => 
        (book.title && book.title.toLowerCase().includes(lowerQuery)) || 
        (book.author && book.author.toLowerCase().includes(lowerQuery)) || 
        (book.notes && book.notes.toLowerCase().includes(lowerQuery))
      );
      
      return results;
    } catch (error) {
      console.error('Erro ao buscar nos favoritos:', error);
      setError('Não foi possível realizar a busca. Por favor, tente novamente.');
      return [];
    }
  }, [favorites]);

  // Verificar se um livro está nos favoritos
  const isBookInFavorites = useCallback((bookId: string | number): boolean => {
    return favorites.some(book => book.id === bookId);
  }, [favorites]);

  // Limpar todos os favoritos
  const clearFavorites = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setFavorites([]);
      
      // Remover do armazenamento local
      await AsyncStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Erro ao limpar favoritos:', error);
      setError('Não foi possível limpar seus favoritos. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Carregar favoritos ao inicializar o hook
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    // Dados
    favorites,
    
    // Estado
    isLoading,
    error,
    
    // Ações
    addToFavorites,
    removeFromFavorites,
    updateBookNotes,
    searchInFavorites,
    isBookInFavorites,
    clearFavorites
  };
}
