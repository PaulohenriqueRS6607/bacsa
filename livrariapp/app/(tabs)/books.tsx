import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { booksApiService, BookItem } from '../BooksApiService';

const { width } = Dimensions.get('window');

// Tipagem para os ícones
type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Interface para categoria com ícone
interface CategoryWithIcon {
  id: string;
  name: string;
  color: string;
  icon: IconName;
  books: BookItem[];
  loading: boolean;
}

// Definição com a tipagem correta para ícones
const CATEGORIES: Array<{id: string; name: string; color: string; icon: IconName}> = [
  { id: 'fantasy', name: 'Fantasia', color: '#3498db', icon: 'planet-outline' },
  { id: 'action', name: 'Ação', color: '#e74c3c', icon: 'flash-outline' },
  { id: 'romance', name: 'Romance', color: '#e84393', icon: 'heart-outline' },
  { id: 'adventure', name: 'Aventura', color: '#f39c12', icon: 'compass-outline' },
  { id: 'fiction', name: 'Ficção', color: '#9b59b6', icon: 'telescope-outline' },
  { id: 'mystery', name: 'Mistério', color: '#2c3e50', icon: 'search-outline' },
  { id: 'horror', name: 'Terror', color: '#7f8c8d', icon: 'skull-outline' },
  { id: 'biography', name: 'Biografia', color: '#27ae60', icon: 'person-outline' },
];

// Inicialização das categorias com livros vazios
const initialCategoryBooks: CategoryWithIcon[] = CATEGORIES.map(cat => ({
  ...cat,
  books: [],
  loading: false
}));

export default function BooksScreen() {
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryBooks, setCategoryBooks] = useState<CategoryWithIcon[]>(initialCategoryBooks);
  const [featuredBook, setFeaturedBook] = useState<BookItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('');  // Iniciar sem categoria selecionada

  // Obter parâmetros da URL usando Expo Router
  const params = useLocalSearchParams();
  
  // Verificar se há parâmetros de URL para categoria
  useEffect(() => {
    const initializeApp = async () => {
      const categoryParam = params.category as string;
      
      // Se houver um parâmetro de categoria, selecionar essa categoria
      if (categoryParam) {
        // Verificar se a categoria existe em nossa lista
        const categoryExists = CATEGORIES.some(cat => cat.id === categoryParam);
        if (categoryExists) {
          setActiveCategory(categoryParam);
          await fetchBooksByCategory(categoryParam);
          return;
        }
      }
      
      // Se não houver parâmetro ou a categoria não existir, carregar todos os livros
      await fetchAllCategoriesBooks();
    };
    
    initializeApp();
  }, [params.category]); // Dependência apenas no parâmetro category para evitar chamadas desnecessárias

  // Função para buscar livros de todas as categorias
  const fetchAllCategoriesBooks = async () => {
    try {
      // Definir todas as categorias como carregando
      const loadingCategories = [...categoryBooks].map(cat => ({
        ...cat,
        loading: true,
        books: [] // Limpar livros antigos para recarregar
      }));
      setCategoryBooks(loadingCategories);
      setError(null);
      
      // Buscar livro em destaque primeiro
      const featured = await booksApiService.getFeaturedBook();
      if (featured) {
        setFeaturedBook(featured);
      }
      
      // Exibir o indicador de carregamento geral apenas para o livro em destaque
      setLoading(false);
      
      // Buscar livros para todas as categorias usando a estratégia de carregamento em lotes
      const categoryIds = CATEGORIES.map(cat => cat.id);
      
      // À medida que os gêneros são carregados em lotes, atualizamos a interface
      booksApiService.getAllCategoriesBooks(categoryIds)
        .then(categoriesData => {
          // Atualizar estados das categorias
          const updatedCategories = [...categoryBooks];
          Object.entries(categoriesData).forEach(([categoryId, books]) => {
            const index = updatedCategories.findIndex(cat => cat.id === categoryId);
            if (index !== -1) {
              updatedCategories[index] = {
                ...updatedCategories[index],
                books: books,
                loading: false
              };
            }
          });
          
          setCategoryBooks(updatedCategories);
        })
        .catch(error => {
          console.error('Erro ao buscar livros:', error);
          setError('Não foi possível carregar os livros. Por favor, tente novamente.');
          
          // Em caso de erro, mostrar alerta
          Alert.alert(
            "Erro ao carregar livros",
            "Ocorreu um problema ao buscar os livros. Estamos usando dados offline.",
            [{ text: "OK" }]
          );
        });
    } catch (error) {
      console.error('Erro no processo de carregamento:', error);
      setError('Erro inesperado. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  // Função para buscar livros de uma categoria específica
  const fetchBooksByCategory = async (categoryId: string) => {
    try {
      // Se clicar na categoria já ativa, desativa a seleção
      if (activeCategory === categoryId) {
        setActiveCategory('');
        // Restaurar o livro em destaque original
        booksApiService.getFeaturedBook().then(book => {
          if (book) setFeaturedBook(book);
        });
        return;
      }
      
      // Atualizar o estado da categoria ativa
      setActiveCategory(categoryId);
      
      // Encontrar o índice da categoria no array
      const categoryIndex = categoryBooks.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) return;
      
      // Atualizar o estado de carregamento apenas para esta categoria
      const updatedCategories = [...categoryBooks];
      updatedCategories[categoryIndex] = {
        ...updatedCategories[categoryIndex],
        loading: true
      };
      setCategoryBooks(updatedCategories);
      
      // Buscar livros da categoria
      const books = await booksApiService.getBooksByCategory(categoryId);
      
      // Atualizar o estado com os novos livros
      const newCategories = [...categoryBooks];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        books: books,
        loading: false
      };
      setCategoryBooks(newCategories);
      
      // Definir um livro desta categoria como destaque
      if (books && books.length > 0) {
        // Escolher um livro aleatório da categoria para apresentar em destaque
        const randomIndex = Math.floor(Math.random() * books.length);
        setFeaturedBook(books[randomIndex]);
      }
    } catch (error) {
      console.error(`Erro ao buscar livros da categoria ${categoryId}:`, error);
      
      // Encontrar o índice da categoria e atualizar para não estar mais carregando
      const categoryIndex = categoryBooks.findIndex(cat => cat.id === categoryId);
      if (categoryIndex !== -1) {
        const newCategories = [...categoryBooks];
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          loading: false
        };
        setCategoryBooks(newCategories);
      }
      
      // Em caso de erro, mostrar alerta
      Alert.alert(
        "Erro ao carregar categoria",
        "Ocorreu um problema ao buscar os livros desta categoria. Tente novamente mais tarde.",
        [{ text: "OK" }]
      );
    }
  };

  // Função para realizar a busca
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAllCategoriesBooks();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Buscar livros com a consulta
      const books = await booksApiService.searchBooks(searchQuery);
      
      // Criar uma categoria de resultados de busca
      const searchResults: CategoryWithIcon = {
        id: 'search-results',
        name: `Resultados para "${searchQuery}"`,
        color: '#1a1a2e',
        icon: 'search-outline' as IconName,
        books: books,
        loading: false
      };
      
      // Definir o primeiro livro como destaque, se houver resultados
      if (books.length > 0) {
        setFeaturedBook(books[0]);
        
        // Criar uma cópia do array de categorias e adicionar os resultados da busca
        const updatedCategories = [...categoryBooks];
        
        // Verificar se já existe uma categoria de resultados de busca
        const searchIndex = updatedCategories.findIndex(cat => cat.id === 'search-results');
        if (searchIndex !== -1) {
          // Atualizar a categoria existente
          updatedCategories[searchIndex] = searchResults;
        } else {
          // Adicionar a nova categoria
          updatedCategories.unshift(searchResults);
        }
        
        setCategoryBooks(updatedCategories);
        setActiveCategory('search-results');
      } else {
        // Se não houver resultados, mostrar mensagem
        Alert.alert(
          "Nenhum resultado encontrado",
          `Não foram encontrados livros para "${searchQuery}"`,
          [{ text: "OK" }]
        );
        
        // Voltar para o estado inicial
        fetchAllCategoriesBooks();
      }
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setError('Não foi possível realizar a busca. Por favor, tente novamente.');
      setFeaturedBook(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir detalhes do livro
  const handleBookPress = (book: BookItem) => {
    // Garantir que o ID seja uma string válida (nunca NaN)
    const bookId = book.id ? String(book.id) : '';
    
    if (!bookId) {
      console.error('Livro sem ID válido:', book);
      Alert.alert(
        "Erro",
        "Não foi possível abrir os detalhes deste livro. ID inválido.",
        [{ text: "OK" }]
      );
      return;
    }
    
    console.log('Navegando para detalhes do livro. ID:', bookId);
    
    router.push({
      pathname: '/book-details',
      params: { id: bookId }
    });
  };

  // Renderizar cada item da lista de livros
  const renderBookItem = (item: BookItem) => {
    const bookCover = item.volumeInfo.imageLinks?.thumbnail || 
                     item.volumeInfo.imageLinks?.smallThumbnail;
    
    // Limitar a descrição a um número razoável de caracteres
    const description = item.volumeInfo.description 
      ? item.volumeInfo.description.substring(0, 100) + (item.volumeInfo.description.length > 100 ? '...' : '')
      : 'Sem descrição disponível';
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.bookItem}
        onPress={() => handleBookPress(item)}
      >
        <View style={styles.bookCover}>
          {bookCover ? (
            <Image 
              source={{ uri: bookCover }}
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.noCoverContainer}>
              <Ionicons name="book-outline" size={40} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.volumeInfo.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Desconhecido'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderizar as categorias com ícones
  const renderCategories = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { backgroundColor: category.color },
              activeCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => fetchBooksByCategory(category.id)}
          >
            <Ionicons name={category.icon} size={20} color="#fff" />
            <Text style={styles.categoryButtonText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Renderizar carrossel para uma categoria específica
  const renderCategoryCarousel = (category: CategoryWithIcon) => {
    // Usando type assertion para corrigir o problema de tipagem com os ícones
    const iconName = category.icon as React.ComponentProps<typeof Ionicons>["name"];
    
    return (
      <View key={category.id} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryHeaderIcon, { backgroundColor: category.color }]}>
            <Ionicons name={iconName} size={24} color="#fff" />
          </View>
          <Text style={styles.categorySectionTitle}>{category.name}</Text>
        </View>
        
        {category.loading ? (
          <View style={styles.categoryLoading}>
            <ActivityIndicator color={category.color} size="small" />
            <Text style={styles.categoryLoadingText}>Carregando livros...</Text>
          </View>
        ) : category.books.length === 0 ? (
          <View style={styles.categoryEmpty}>
            <Text style={styles.categoryEmptyText}>Nenhum livro encontrado</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryBooksContainer}
          >
            {category.books.map(book => renderBookItem(book))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#ddd" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar livros..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.trim() !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#ddd" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Carregando livros...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchBooksByCategory(activeCategory)}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Livro em destaque */}
          {featuredBook && (
            <View style={styles.featuredSection}>
              <ImageBackground
                source={{ 
                  uri: featuredBook.volumeInfo.imageLinks?.thumbnail || 
                       'https://images.unsplash.com/photo-1532012197267-da84d127e765'
                }}
                style={styles.featuredBackground}
                blurRadius={3}
              >
                <View style={styles.gradient}>
                  <Text style={styles.featuredTitle}>
                    {featuredBook.volumeInfo.title}
                  </Text>
                  
                  {featuredBook.volumeInfo.authors && (
                    <Text style={styles.featuredAuthor}>
                      {featuredBook.volumeInfo.authors.join(', ')}
                    </Text>
                  )}
                  
                  {renderCategories()}
                  
                  <TouchableOpacity 
                    style={styles.readButton}
                    onPress={() => handleBookPress(featuredBook)}
                  >
                    <Ionicons name="eye-outline" size={20} color="#fff" />
                    <Text style={styles.readButtonText}>Ler agora</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          )}
          
          {/* Removido o título "Recomendados para você" */}
          
          {/* Carrosséis de livros por categoria */}
          {activeCategory 
            ? categoryBooks.filter(cat => cat.id === activeCategory).map(category => renderCategoryCarousel(category))
            : categoryBooks.map(category => renderCategoryCarousel(category))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  // Estilos para as seções de categoria
  categorySection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryBooksContainer: {
    paddingVertical: 8,
  },
  categoryLoading: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLoadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  categoryEmpty: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmptyText: {
    color: '#aaa',
    fontSize: 14,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#16213e',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  featuredSection: {
    width: '100%',
    height: 300,
  },
  featuredBackground: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featuredAuthor: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  activeCategoryButton: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  readButton: {
    flexDirection: 'row',
    backgroundColor: '#e94560',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  readButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  bookItem: {
    width: 150,
    marginRight: 15,
    marginVertical: 10,
    backgroundColor: 'transparent', // Removido o fundo escuro
    borderRadius: 12,
    padding: 8,
    height: 260,  // Altura fixa para todos os itens
  },
  bookCover: {
    height: 180,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0f3460',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noCoverContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3460',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 2,
  },
  emptyContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
