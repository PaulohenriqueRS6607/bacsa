import { useState, useCallback } from 'react';

export type CategoryId = 'all' | 'fiction' | 'science' | 'history' | 'biography' | 'technology';

export interface Category {
  id: CategoryId;
  label: string;
  query: string;
}

export function useCategoryService() {
  // Categorias predefinidas
  const [categories] = useState<Category[]>([
    { id: 'all', label: 'Todos', query: 'subject:*' },
    { id: 'fiction', label: 'Ficção', query: 'subject:fiction' },
    { id: 'science', label: 'Ciência', query: 'subject:science' },
    { id: 'history', label: 'História', query: 'subject:history' },
    { id: 'biography', label: 'Biografia', query: 'subject:biography' },
    { id: 'technology', label: 'Tecnologia', query: 'subject:technology' },
  ]);
  
  // Estado para a categoria atualmente selecionada
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  
  // Função para mudar a categoria ativa
  const changeCategory = useCallback((categoryId: CategoryId) => {
    setActiveCategory(categoryId);
  }, []);
  
  // Obter a categoria ativa
  const getActiveCategory = useCallback(() => {
    return categories.find(c => c.id === activeCategory);
  }, [categories, activeCategory]);
  
  return {
    categories,
    activeCategory,
    changeCategory,
    getActiveCategory
  };
}
