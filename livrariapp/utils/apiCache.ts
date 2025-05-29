// Utilitário para gerenciar cache da API e evitar múltiplas requisições

// Tipo para os itens em cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Classe para gerenciar o cache
export class ApiCache {
  private static instance: ApiCache;
  private cache: Record<string, CacheItem<any>> = {};
  private readonly CACHE_DURATION = 1000 * 60 * 10; // 10 minutos
  private lastRequestTime = 0;
  private readonly THROTTLE_TIME = 1000; // 1 segundo entre requisições

  // Singleton
  private constructor() {}

  public static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  // Verificar se podemos fazer uma requisição (limitar taxa)
  public canMakeRequest(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime < this.THROTTLE_TIME) {
      return false;
    }
    this.lastRequestTime = now;
    return true;
  }

  // Obter item do cache
  public get<T>(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.CACHE_DURATION) {
      // Cache expirado
      delete this.cache[key];
      return null;
    }

    return item.data as T;
  }

  // Salvar item no cache
  public set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }

  // Verificar se uma chave existe no cache
  public has(key: string): boolean {
    const item = this.cache[key];
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > this.CACHE_DURATION) {
      // Cache expirado
      delete this.cache[key];
      return false;
    }

    return true;
  }

  // Limpar cache
  public clear(): void {
    this.cache = {};
  }
}

// Exportar instância única
export const apiCache = ApiCache.getInstance();
