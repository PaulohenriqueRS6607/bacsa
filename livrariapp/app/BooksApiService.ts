import axios from 'axios';
import { apiCache } from '../utils/apiCache';
import { mockBooksByCategory, MockBookItem } from '../data/mockBooks';

// Interface para itens de livro
export interface BookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    categories?: string[];
  };
}

// Serviço para gerenciar requisições à API de livros
export class BooksApiService {
  private static instance: BooksApiService;
  private useMockData = false;
  
  // Singleton
  private constructor() {}
  
  public static getInstance(): BooksApiService {
    if (!BooksApiService.instance) {
      BooksApiService.instance = new BooksApiService();
    }
    return BooksApiService.instance;
  }
  
  // Definir se deve usar dados mockados
  public setUseMockData(value: boolean): void {
    this.useMockData = value;
  }
  
  // Obter se está usando dados mockados
  public isUsingMockData(): boolean {
    return this.useMockData;
  }
  
  // Buscar livro em destaque
  public async getFeaturedBook(): Promise<BookItem | null> {
    try {
      // Usar dados mockados se necessário
      if (this.useMockData) {
        const randomCategories = ['fantasy', 'fiction', 'adventure', 'mystery'];
        const randomCategory = randomCategories[Math.floor(Math.random() * randomCategories.length)];
        const mockCategoryBooks = mockBooksByCategory[randomCategory] || [];
        
        if (mockCategoryBooks.length > 0) {
          const randomIndex = Math.floor(Math.random() * mockCategoryBooks.length);
          return mockCategoryBooks[randomIndex] as BookItem;
        }
        
        return null;
      }
      
      // Verificar cache primeiro
      const cacheKey = 'featured_book';
      const cachedData = apiCache.get<BookItem>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Se pudermos fazer requisição
      if (apiCache.canMakeRequest()) {
        const randomCategories = ['fantasy', 'fiction', 'adventure', 'mystery'];
        const randomCategory = randomCategories[Math.floor(Math.random() * randomCategories.length)];
        
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
          params: {
            q: `subject:${randomCategory}`,
            maxResults: 10
          }
        });
        
        if (response.data && response.data.items && response.data.items.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.data.items.length);
          const featuredBook = response.data.items[randomIndex];
          
          // Salvar no cache
          apiCache.set(cacheKey, featuredBook);
          
          return featuredBook;
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('Erro ao buscar livro em destaque:', error);
      
      // Se erro for de muitas requisições, mudar para dados mockados
      if (error.response && error.response.status === 429) {
        this.useMockData = true;
        return this.getFeaturedBook(); // Tentar novamente com dados mockados
      }
      
      return null;
    }
  }
  
  // Função auxiliar para criar uma requisição com timeout
  private async fetchWithTimeout(url: string, options: any, timeout = 3000): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await axios({
        ...options,
        url,
        signal: controller.signal as any
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  // Buscar livros por categoria
  public async getBooksByCategory(categoryId: string): Promise<BookItem[]> {
    try {
      // Usar dados mockados se necessário
      if (this.useMockData) {
        console.log(`Usando dados mockados para categoria: ${categoryId}`);
        return (mockBooksByCategory[categoryId] || []) as BookItem[];
      }
      
      // Verificar cache primeiro
      const cacheKey = `category_${categoryId}`;
      const cachedData = apiCache.get<BookItem[]>(cacheKey);
      if (cachedData) {
        console.log(`Usando cache para categoria: ${categoryId}`);
        return cachedData;
      }
      
      // Se pudermos fazer requisição
      if (apiCache.canMakeRequest()) {
        console.log(`Buscando categoria: ${categoryId} da API`);
        try {
          // Usar timeout para evitar que a requisição demore muito
          const response = await this.fetchWithTimeout(
            'https://www.googleapis.com/books/v1/volumes', 
            {
              method: 'GET',
              params: {
                q: `subject:${categoryId}`,
                maxResults: 12
              }
            },
            5000 // 5 segundos de timeout
          );
          
          if (response.data && response.data.items) {
            // Salvar no cache
            apiCache.set(cacheKey, response.data.items);
            return response.data.items;
          }
        } catch (fetchError: any) {
          console.error(`Timeout ou erro ao buscar categoria ${categoryId}:`, fetchError);
          // Em caso de timeout ou qualquer erro na requisição, usar dados mockados
          console.log(`Usando fallback para dados mockados na categoria: ${categoryId}`);
          return (mockBooksByCategory[categoryId] || []) as BookItem[];
        }
      } else {
        console.log(`Limite de requisições atingido, usando mockados para: ${categoryId}`);
        return (mockBooksByCategory[categoryId] || []) as BookItem[];
      }
      
      return [];
    } catch (error: any) {
      console.error(`Erro ao buscar livros da categoria ${categoryId}:`, error);
      
      // Se erro for de muitas requisições, mudar para dados mockados
      if (error.response && error.response.status === 429) {
        this.useMockData = true;
        console.log('Erro 429: Muitas requisições, mudando para modo offline');
        return this.getBooksByCategory(categoryId); // Tentar novamente com dados mockados
      }
      
      // Para qualquer erro, usar dados mockados como fallback
      return (mockBooksByCategory[categoryId] || []) as BookItem[];
    }
  }
  
  // Buscar todos os livros para todas as categorias
  public async getAllCategoriesBooks(categories: string[]): Promise<Record<string, BookItem[]>> {
    try {
      const result: Record<string, BookItem[]> = {};
      
      // Usar estratégia de batchs para evitar muitas requisições paralelas
      // Carregar no máximo 2 categorias por vez
      const batchSize = 2;
      
      // Processar as categorias em batches
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = categories.slice(i, i + batchSize);
        console.log(`Carregando batch de categorias ${i + 1}-${Math.min(i + batchSize, categories.length)} de ${categories.length}`);
        
        // Await para aguardar este batch completar antes de iniciar o próximo
        await Promise.all(
          batch.map(async (categoryId) => {
            try {
              const books = await this.getBooksByCategory(categoryId);
              result[categoryId] = books;
            } catch (err) {
              console.error(`Erro ao carregar categoria ${categoryId}:`, err);
              // Em caso de erro, usar dados mockados
              result[categoryId] = (mockBooksByCategory[categoryId] || []) as BookItem[];
            }
          })
        );
        
        // Adicionar um pequeno atraso entre os batches para não sobrecarregar a API
        if (i + batchSize < categories.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar livros de todas as categorias:', error);
      // Em caso de erro geral, usar dados mockados para todas as categorias
      const mockResult: Record<string, BookItem[]> = {};
      categories.forEach(categoryId => {
        mockResult[categoryId] = (mockBooksByCategory[categoryId] || []) as BookItem[];
      });
      return mockResult;
    }
  }
  
  // Buscar livros por consulta
  public async searchBooks(query: string): Promise<BookItem[]> {
    try {
      // Usar dados mockados se necessário
      if (this.useMockData) {
        // Pesquisa simples em dados mockados
        const allBooks = Object.values(mockBooksByCategory).flat();
        return allBooks.filter(book => 
          book.volumeInfo.title.toLowerCase().includes(query.toLowerCase()) ||
          (book.volumeInfo.authors && book.volumeInfo.authors.some(author => 
            author.toLowerCase().includes(query.toLowerCase())
          ))
        ) as BookItem[];
      }
      
      // Verificar cache primeiro
      const cacheKey = `search_${query}`;
      const cachedData = apiCache.get<BookItem[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Se pudermos fazer requisição
      if (apiCache.canMakeRequest()) {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
          params: {
            q: query,
            maxResults: 20
          }
        });
        
        if (response.data && response.data.items) {
          // Salvar no cache
          apiCache.set(cacheKey, response.data.items);
          return response.data.items;
        }
      }
      
      return [];
    } catch (error: any) {
      console.error(`Erro ao buscar livros para a consulta "${query}":`, error);
      
      // Se erro for de muitas requisições, mudar para dados mockados
      if (error.response && error.response.status === 429) {
        this.useMockData = true;
        return this.searchBooks(query); // Tentar novamente com dados mockados
      }
      
      return [];
    }
  }
}

// Exportar instância única
export const booksApiService = BooksApiService.getInstance();
