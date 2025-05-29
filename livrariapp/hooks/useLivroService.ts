import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, LivroBackend, mapExternalBookToInternal } from '../constants/Api';

export interface UseLivroServiceResult {
  livros: any[];
  livro: any | null;
  isLoading: boolean;
  error: string | null;
  buscarTodos: () => Promise<void>;
  buscarPorId: (id: number) => Promise<any>;
  buscarPorTitulo: (titulo: string) => Promise<any[]>;
  buscarPorAutor: (autor: string) => Promise<any[]>;
  buscarPorGenero: (genero: string) => Promise<any[]>;
  adicionarFavorito: (livro: any) => Promise<void>;
  removerFavorito: (id: number) => Promise<void>;
  getFavoritos: () => Promise<any[]>;
}

const useLivroService = (): UseLivroServiceResult => {
  const [livros, setLivros] = useState<any[]>([]);
  const [livro, setLivro] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar todos os livros
  const buscarTodos = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<LivroBackend[]>(API_ENDPOINTS.LIVROS.BASE);
      const livrosMapeados = response.data.map(mapExternalBookToInternal);
      setLivros(livrosMapeados);
    } catch (err) {
      console.error('Erro ao buscar livros:', err);
      setError('Não foi possível carregar os livros. Verifique sua conexão.');
      
      // Fallback para dados offline ou mockados
      try {
        const cachedData = await AsyncStorage.getItem('livros_cache');
        if (cachedData) {
          setLivros(JSON.parse(cachedData));
        }
      } catch (cacheErr) {
        console.error('Erro ao buscar cache:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar livro por ID
  const buscarPorId = async (id: number): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<LivroBackend>(API_ENDPOINTS.LIVROS.POR_ID(id));
      const livroMapeado = mapExternalBookToInternal(response.data);
      setLivro(livroMapeado);
      return livroMapeado;
    } catch (err) {
      console.error(`Erro ao buscar livro com ID ${id}:`, err);
      setError('Não foi possível carregar os detalhes deste livro.');
      
      // Sistema de fallback
      try {
        // Tenta encontrar nos dados locais
        const cachedData = await AsyncStorage.getItem('livros_cache');
        if (cachedData) {
          const livrosCache = JSON.parse(cachedData);
          const livroEncontrado = livrosCache.find((l: any) => l.id === id);
          if (livroEncontrado) {
            setLivro(livroEncontrado);
            return livroEncontrado;
          }
        }
        
        // Se não encontrar, retorna null
        setLivro(null);
        return null;
      } catch (cacheErr) {
        console.error('Erro ao buscar cache:', cacheErr);
        setLivro(null);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar livros por título
  const buscarPorTitulo = async (titulo: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<LivroBackend[]>(API_ENDPOINTS.LIVROS.BUSCA_TITULO(titulo));
      const livrosMapeados = response.data.map(mapExternalBookToInternal);
      return livrosMapeados;
    } catch (err) {
      console.error(`Erro ao buscar livros com título "${titulo}":`, err);
      setError('Não foi possível realizar a busca por título.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar livros por autor
  const buscarPorAutor = async (autor: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<LivroBackend[]>(API_ENDPOINTS.LIVROS.BUSCA_AUTOR(autor));
      const livrosMapeados = response.data.map(mapExternalBookToInternal);
      return livrosMapeados;
    } catch (err) {
      console.error(`Erro ao buscar livros do autor "${autor}":`, err);
      setError('Não foi possível realizar a busca por autor.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar livros por gênero
  const buscarPorGenero = async (genero: string): Promise<any[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<LivroBackend[]>(API_ENDPOINTS.LIVROS.BUSCA_GENERO(genero));
      const livrosMapeados = response.data.map(mapExternalBookToInternal);
      return livrosMapeados;
    } catch (err) {
      console.error(`Erro ao buscar livros do gênero "${genero}":`, err);
      setError('Não foi possível realizar a busca por gênero.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Gerenciamento de favoritos
  const adicionarFavorito = async (livro: any): Promise<void> => {
    try {
      const favoritosStr = await AsyncStorage.getItem('favoritos') || '[]';
      const favoritos = JSON.parse(favoritosStr);
      
      // Verifica se o livro já está nos favoritos
      if (!favoritos.some((fav: any) => fav.id === livro.id)) {
        favoritos.push(livro);
        await AsyncStorage.setItem('favoritos', JSON.stringify(favoritos));
      }
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      setError('Não foi possível adicionar aos favoritos.');
    }
  };

  const removerFavorito = async (id: number): Promise<void> => {
    try {
      const favoritosStr = await AsyncStorage.getItem('favoritos') || '[]';
      const favoritos = JSON.parse(favoritosStr);
      
      const novosFavoritos = favoritos.filter((fav: any) => fav.id !== id);
      await AsyncStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      setError('Não foi possível remover dos favoritos.');
    }
  };

  const getFavoritos = async (): Promise<any[]> => {
    try {
      const favoritosStr = await AsyncStorage.getItem('favoritos') || '[]';
      return JSON.parse(favoritosStr);
    } catch (err) {
      console.error('Erro ao recuperar favoritos:', err);
      setError('Não foi possível carregar seus favoritos.');
      return [];
    }
  };

  return {
    livros,
    livro,
    isLoading,
    error,
    buscarTodos,
    buscarPorId,
    buscarPorTitulo,
    buscarPorAutor,
    buscarPorGenero,
    adicionarFavorito,
    removerFavorito,
    getFavoritos
  };
};

export default useLivroService;
