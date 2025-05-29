import { useState, useEffect, useCallback } from 'react';
import { User } from '../app/(tabs)/_layout';

// Solução temporária: usando um mock do AsyncStorage enquanto a dependência real não está disponível
const AsyncStorage = {
  getItem: async (key: string) => {
    try {
      console.log('Mock getItem', key);
      // Retorna alguns dados mock para facilitar o teste
      if (key === 'user') {
        return null; // Usuário começa deslogado
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
  }
};

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData extends LoginCredentials {
  nome: string;
  fotoPerfil?: string;
}

export interface AuthServiceResult {
  // Dados
  user: User | null;
  
  // Estado
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Ações
  login: (email: string, senha: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
}

export function useAuthService(): AuthServiceResult {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar se o usuário está autenticado
  const isAuthenticated = !!user;

  // Carregar usuário do armazenamento local
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setError('Não foi possível carregar os dados do usuário. Por favor, faça login novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma aplicação real, faríamos uma chamada HTTP para autenticar o usuário
      // E receberíamos um token de autenticação
      
      // Criar um usuário mock para testes
      const mockUser: User = {
        id: '1',
        nome: 'Usuário de Teste',
        email,
        role: 'user'
      };
      
      // Salvar usuário no estado
      setUser(mockUser);
      
      // Salvar no armazenamento local
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError('Não foi possível fazer login. Verifique suas credenciais e tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registro
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Em uma aplicação real, faríamos uma chamada HTTP para registrar o usuário
      
      // Criar um novo usuário
      const newUser: User = {
        id: `${Date.now()}`, // Gerar um ID único
        nome: data.nome,
        email: data.email,
        fotoPerfil: data.fotoPerfil,
        role: 'user'
      };
      
      // Salvar usuário no estado
      setUser(newUser);
      
      // Salvar no armazenamento local
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setError('Não foi possível criar sua conta. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Limpar o usuário do estado
      setUser(null);
      
      // Remover do armazenamento local
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Não foi possível sair da sua conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar perfil do usuário
  const updateUserProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!user) {
        setError('Você precisa estar logado para atualizar seu perfil.');
        return false;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Simular uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em uma aplicação real, faríamos uma chamada HTTP para atualizar o perfil
      
      // Atualizar o usuário
      const updatedUser: User = {
        ...user,
        ...data
      };
      
      // Salvar usuário atualizado no estado
      setUser(updatedUser);
      
      // Salvar no armazenamento local
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Não foi possível atualizar seu perfil. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carregar usuário ao inicializar o hook
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    // Dados
    user,
    
    // Estado
    isLoading,
    error,
    isAuthenticated,
    
    // Ações
    login,
    register,
    logout,
    updateUserProfile
  };
}
