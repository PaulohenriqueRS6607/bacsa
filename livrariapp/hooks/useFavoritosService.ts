import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookItem } from '../app/BooksApiService';
import { API_BASE_URL } from '../constants/Api';
import { Platform, Dimensions } from 'react-native';

// Identificador único para o dispositivo
const getDeviceId = async (): Promise<string> => {
  try {
    // Primeiro, tenta pegar um ID já salvo
    let deviceId = await AsyncStorage.getItem('device_id');
    
    // Se não existir, cria um novo
    if (!deviceId) {
      // Usa informações do dispositivo disponíveis na API padrão do React Native
      const platform = Platform.OS;
      const version = Platform.Version;
      const { width, height } = Dimensions.get('window');
      const randomId = Math.random().toString(36).substring(2, 15);
      
      // Cria um ID único combinando informações disponíveis
      deviceId = `${platform}-${version}-${width}x${height}-${randomId}-${Date.now()}`;
      
      // Salva para uso futuro
      await AsyncStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Erro ao obter device ID:', error);
    // Fallback para um ID temporário se ocorrer erro
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
};

// Converter livro do Google Books para o formato do backend
const convertGoogleBookToBackendFormat = (book: BookItem) => {
  return {
    googleBooksId: book.id,
    titulo: book.volumeInfo.title || 'Sem título',
    autor: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Autor desconhecido',
    imagemUrl: book.volumeInfo.imageLinks?.thumbnail || '',
    descricao: book.volumeInfo.description || 'Sem descrição disponível',
    dataPublicacao: book.volumeInfo.publishedDate || ''
  };
};

// Converter dados do backend para o formato do Google Books
const convertBackendToGoogleFormat = (favorito: any): BookItem => {
  return {
    id: favorito.googleBooksId,
    volumeInfo: {
      title: favorito.titulo,
      authors: favorito.autor ? [favorito.autor] : undefined,
      description: favorito.descricao,
      imageLinks: {
        thumbnail: favorito.imagemUrl
      },
      publishedDate: favorito.dataPublicacao,
      categories: []
    }
  };
};

export interface UseFavoritosResult {
  favoritos: BookItem[];
  isLoading: boolean;
  error: string | null;
  adicionarFavorito: (book: BookItem) => Promise<boolean>;
  removerFavorito: (bookId: string) => Promise<boolean>;
  isFavorito: (bookId: string) => Promise<boolean>;
  atualizarFavoritos: () => Promise<void>;
  sincronizar: () => Promise<void>;
}

const useFavoritosService = (): UseFavoritosResult => {
  const [favoritos, setFavoritos] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Inicializar o device ID
  useEffect(() => {
    const initDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    
    initDeviceId();
  }, []);

  // Carregar favoritos do backend
  const carregarFavoritosDoBackend = async (): Promise<BookItem[]> => {
    if (!deviceId) return [];
    
    try {
      // Adicionar timeout para evitar esperas longas
      // Agora usando o novo endpoint da tabela livros
      const response = await axios.get(`${API_BASE_URL}/livros/favoritos/device/${deviceId}`, {
        timeout: 3000 // 3 segundos
      });
      
      // Converter os dados do backend para o formato Google Books
      return response.data.map(convertBackendToGoogleFormat);
    } catch (err) {
      console.error('Erro ao carregar favoritos do backend:', err);
      // Em vez de propagar o erro, retornamos uma lista vazia
      return [];
    }
  };

  // Carregar favoritos do AsyncStorage (cache local)
  const carregarFavoritosLocais = async (): Promise<BookItem[]> => {
    try {
      const favoritosStr = await AsyncStorage.getItem('favoritos_local');
      return favoritosStr ? JSON.parse(favoritosStr) : [];
    } catch (err) {
      console.error('Erro ao carregar favoritos locais:', err);
      return [];
    }
  };

  // Salvar favoritos no AsyncStorage (cache local)
  const salvarFavoritosLocais = async (items: BookItem[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('favoritos_local', JSON.stringify(items));
    } catch (err) {
      console.error('Erro ao salvar favoritos locais:', err);
    }
  };

  // Atualizar a lista de favoritos
  const atualizarFavoritos = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Tenta buscar do backend primeiro
      const favoritosBackend = await carregarFavoritosDoBackend();
      
      // Se conseguiu dados do backend, usa-os
      if (favoritosBackend.length > 0) {
        setFavoritos(favoritosBackend);
        // Atualiza o cache local
        await salvarFavoritosLocais(favoritosBackend);
      } else {
        // Se o backend retornou vazio, mas pode ser erro silencioso, usa cache local
        const favoritosLocais = await carregarFavoritosLocais();
        setFavoritos(favoritosLocais);
        setError('Usando dados armazenados localmente');
      }
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err);
      setError('Não foi possível carregar favoritos do servidor');
      
      // Fallback para favoritos locais em caso de erro
      const favoritosLocais = await carregarFavoritosLocais();
      setFavoritos(favoritosLocais);
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar favoritos locais com o backend
  const sincronizar = async (): Promise<void> => {
    if (!deviceId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Pegar favoritos locais
      const favoritosLocais = await carregarFavoritosLocais();
      
      try {
        // Tentar pegar favoritos do backend com timeout
        const favoritosBackend = await carregarFavoritosDoBackend();
        
        // Identificar favoritos que existem localmente mas não no backend
        const idsBackend = favoritosBackend.map(item => item.id);
        const novosFavoritos = favoritosLocais.filter(item => !idsBackend.includes(item.id));
        
        // Enviar novos favoritos para o backend
        for (const book of novosFavoritos) {
          try {
            // Preparar dados para o backend
            const bookData = convertGoogleBookToBackendFormat(book);
            
            // Enviar para o backend com timeout
            await axios.post(`${API_BASE_URL}/favoritos`, {
              deviceId,
              googleBooksId: book.id,
              titulo: bookData.titulo,
              autor: bookData.autor,
              imagemUrl: bookData.imagemUrl,
              descricao: bookData.descricao,
              dataPublicacao: bookData.dataPublicacao
            }, {
              timeout: 3000 // 3 segundos
            });
          } catch (bookError) {
            console.error(`Erro ao sincronizar livro ${book.id}:`, bookError);
            // Continua para o próximo livro
          }
        }
      } catch (backendErr) {
        console.error('Erro ao acessar o backend durante sincronização:', backendErr);
        setError('Usando dados armazenados localmente');
        setFavoritos(favoritosLocais);
        setIsLoading(false);
        return;
      }
      
      // Atualizar a lista de favoritos
      await atualizarFavoritos();
    } catch (err) {
      console.error('Erro ao sincronizar favoritos:', err);
      setError('Falha ao sincronizar favoritos com o servidor');
      
      // Usar dados locais em caso de erro completo
      const favoritosLocais = await carregarFavoritosLocais();
      setFavoritos(favoritosLocais);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se um livro é favorito
  const isFavorito = async (bookId: string): Promise<boolean> => {
    if (!deviceId) return false;
    
    try {
      // Tentar verificar no backend com timeout usando o novo endpoint
      const response = await axios.get(`${API_BASE_URL}/livros/favoritos/check`, {
        params: { deviceId, googleBooksId: bookId },
        timeout: 3000 // 3 segundos
      });
      return response.data;
    } catch (err) {
      console.error('Erro ao verificar favorito no backend:', err);
      
      // Fallback para verificação local
      const favoritosLocais = await carregarFavoritosLocais();
      return favoritosLocais.some(item => item.id === bookId);
    }
  };

  // Adicionar livro aos favoritos
  const adicionarFavorito = async (book: BookItem): Promise<boolean> => {
    if (!deviceId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Preparar dados para o backend
      const bookData = convertGoogleBookToBackendFormat(book);
      
      // Primeiro, verificar se o livro já é favorito localmente
      const favoritosLocais = await carregarFavoritosLocais();
      if (favoritosLocais.some(item => item.id === book.id)) {
        setIsLoading(false);
        return true; // Já está nos favoritos locais
      }
      
      try {
        // Tentar enviar para o backend com timeout usando o novo endpoint
        await axios.post(`${API_BASE_URL}/livros/favoritos`, {
          deviceId,
          googleBooksId: book.id,
          titulo: bookData.titulo,
          autor: bookData.autor,
          imagemUrl: bookData.imagemUrl,
          descricao: bookData.descricao,
          dataPublicacao: bookData.dataPublicacao
        }, {
          timeout: 3000 // 3 segundos
        });
      } catch (backendErr) {
        console.error('Erro ao salvar no backend, salvando apenas localmente:', backendErr);
        // Continuamos o fluxo para salvar localmente
      }
      
      // Atualizar lista local em qualquer caso
      const novosFavoritos = [...favoritos, book];
      setFavoritos(novosFavoritos);
      await salvarFavoritosLocais(novosFavoritos);
      
      return true;
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      setError('Não foi possível adicionar aos favoritos');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover livro dos favoritos
  const removerFavorito = async (bookId: string): Promise<boolean> => {
    if (!deviceId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      try {
        // Tentar remover do backend com timeout usando o novo endpoint
        await axios.delete(`${API_BASE_URL}/livros/favoritos`, {
          params: { deviceId, googleBooksId: bookId },
          timeout: 3000 // 3 segundos
        });
      } catch (backendErr) {
        console.error('Erro ao remover do backend, removendo apenas localmente:', backendErr);
        // Continuamos o fluxo para remover localmente
      }
      
      // Atualizar lista local em qualquer caso
      const novosFavoritos = favoritos.filter(item => item.id !== bookId);
      setFavoritos(novosFavoritos);
      await salvarFavoritosLocais(novosFavoritos);
      
      return true;
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      setError('Não foi possível remover dos favoritos');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar favoritos quando o deviceId estiver disponível
  useEffect(() => {
    if (deviceId) {
      atualizarFavoritos();
    }
  }, [deviceId]);

  return {
    favoritos,
    isLoading,
    error,
    adicionarFavorito,
    removerFavorito,
    isFavorito,
    atualizarFavoritos,
    sincronizar
  };
};

export default useFavoritosService;
