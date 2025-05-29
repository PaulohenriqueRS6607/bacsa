import React, { useState, createContext, useContext } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Definindo tipos básicos
export interface User {
  id: string;
  nome: string;
  email: string;
  fotoPerfil?: string;
  role: string;
}

export interface Book {
  id: string | number;
  title: string;
  author?: string;
  description?: string;
  cover?: string;
}

export interface SavedBook extends Book {
  savedAt: string;
  notes?: string;
}

// Context para o estado global da aplicação
export interface BibliotecaContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => Promise<void>;
  favoritos: SavedBook[];
  addToFavorites: (book: Book) => Promise<boolean>;
  removeFromFavorites: (bookId: string | number) => Promise<boolean>;
  updateBookNotes: (bookId: string | number, notes: string) => Promise<boolean>;
  searchInFavorites: (query: string) => Promise<SavedBook[]>;
  error: string | null;
}

// Criando o contexto com valores padrão
export const BibliotecaContext = createContext<BibliotecaContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  favoritos: [],
  addToFavorites: async () => false,
  removeFromFavorites: async () => false,
  updateBookNotes: async () => false,
  searchInFavorites: async () => [],
  error: null
});

// Hook para acessar o contexto
export function useBiblioteca() {
  return useContext(BibliotecaContext);
}

// Provider para o contexto
function BibliotecaProvider({ children }: { children: React.ReactNode }) {
  // Estado básico da aplicação
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favoritos, setFavoritos] = useState<SavedBook[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Login simulado
  const login = async (email: string, senha: string) => {
    try {
      setIsLoading(true);
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados para teste
      setUser({
        id: '1',
        nome: 'Usuário de Teste',
        email: email,
        role: 'user'
      });
      
      return true;
    } catch (err) {
      setError('Erro ao fazer login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout simulado
  const logout = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      setFavoritos([]);
    } catch (err) {
      setError('Erro ao fazer logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar livro aos favoritos
  const addToFavorites = async (book: Book) => {
    try {
      const newBook: SavedBook = {
        ...book,
        savedAt: new Date().toISOString()
      };
      
      setFavoritos([...favoritos, newBook]);
      return true;
    } catch (err) {
      setError('Erro ao adicionar aos favoritos');
      return false;
    }
  };

  // Remover livro dos favoritos
  const removeFromFavorites = async (bookId: string | number) => {
    try {
      setFavoritos(favoritos.filter(book => book.id !== bookId));
      return true;
    } catch (err) {
      setError('Erro ao remover dos favoritos');
      return false;
    }
  };

  // Atualizar notas de um livro
  const updateBookNotes = async (bookId: string | number, notes: string) => {
    try {
      setFavoritos(favoritos.map(book => 
        book.id === bookId ? { ...book, notes } : book
      ));
      return true;
    } catch (err) {
      setError('Erro ao atualizar notas');
      return false;
    }
  };

  // Buscar nos favoritos
  const searchInFavorites = async (query: string) => {
    try {
      const lowerQuery = query.toLowerCase();
      return favoritos.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) || 
        (book.author && book.author.toLowerCase().includes(lowerQuery))
      );
    } catch (err) {
      setError('Erro ao buscar favoritos');
      return [];
    }
  };

  return (
    <BibliotecaContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      favoritos,
      addToFavorites,
      removeFromFavorites,
      updateBookNotes,
      searchInFavorites,
      error
    }}>
      {children}
    </BibliotecaContext.Provider>
  );
}

// Layout principal das abas
import Footer from '../../components/layouts/Footer';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function TabLayout() {
  return (
    <BibliotecaProvider>
      <SafeAreaProvider>
        {/* StatusBar configurada como na tela de livros */}
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#1a1a2e" 
          translucent={true} 
        />
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: {
            backgroundColor: '#1a1a2e' // Usando o mesmo background da tela de livros
          }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="books" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="profile" />
        </Stack>
        <Footer />
      </SafeAreaProvider>
    </BibliotecaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#493628',
    borderTopWidth: 0,
    paddingTop: 5,
    paddingBottom: 5,
    height: 60,
  }
});
