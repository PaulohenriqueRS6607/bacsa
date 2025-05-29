import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import useBackendService from '../../hooks/useBackendService';
import { BookItem } from '../BooksApiService';

const { width } = Dimensions.get('window');

// Tipagem para os ícones
type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Interface para categoria com ícone
interface CategoryWithIcon {
  id: string;
  name: string;
  color: string;
  icon: IconName;
}

// Definição com a tipagem correta para ícones
const CATEGORIES: CategoryWithIcon[] = [
  { id: 'fantasy', name: 'Fantasia', color: '#3498db', icon: 'planet-outline' },
  { id: 'action', name: 'Ação', color: '#e74c3c', icon: 'flash-outline' },
  { id: 'romance', name: 'Romance', color: '#e84393', icon: 'heart-outline' },
  { id: 'adventure', name: 'Aventura', color: '#f39c12', icon: 'compass-outline' },
  { id: 'fiction', name: 'Ficção', color: '#9b59b6', icon: 'telescope-outline' },
  { id: 'mystery', name: 'Mistério', color: '#2c3e50', icon: 'search-outline' },
  { id: 'horror', name: 'Terror', color: '#7f8c8d', icon: 'skull-outline' },
  { id: 'biography', name: 'Biografia', color: '#27ae60', icon: 'person-outline' },
];

export default function BackendBooksScreen() {
  const { livrosFromBackend, isLoading, error, fetchAllBooks } = useBackendService();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [searchResults, setSearchResults] = useState<BookItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsFetching(true);
    try {
      await fetchAllBooks();
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os livros. Tente novamente.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    setIsFetching(true);
    try {
      // Filtrar livros localmente (poderia ser uma chamada de API específica)
      const filtered = livrosFromBackend.filter(book => {
        const title = book.volumeInfo.title?.toLowerCase() || '';
        const authors = book.volumeInfo.authors?.join(' ').toLowerCase() || '';
        return title.includes(searchQuery.toLowerCase()) || 
               authors.includes(searchQuery.toLowerCase());
      });
      
      setSearchResults(filtered);
      setShowSearch(true);
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Falha na busca. Tente novamente.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const renderCategoryButton = ({ item }: { item: CategoryWithIcon }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { backgroundColor: item.color },
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons name={item.icon} size={20} color="white" />
      <Text style={styles.categoryButtonText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const filteredBooks = selectedCategory 
    ? livrosFromBackend.filter(book => {
        const categories = book.volumeInfo.categories || [];
        return categories.some((cat: string) => 
          cat.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      })
    : livrosFromBackend;

  const displayBooks = showSearch ? searchResults : filteredBooks;

  const renderBookItem = ({ item }: { item: BookItem }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => router.push(`/book-details?id=${item.id}`)}
    >
      <Image
        source={{ uri: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Sem+Capa' }}
        style={styles.bookCover}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.volumeInfo.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.volumeInfo.authors?.[0] || 'Autor desconhecido'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    setSearchResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca Backend</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadBooks}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar livros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#777"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Informação de status */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadBooks}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status da conexão com backend */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: error ? 'red' : 'green' }]} />
        <Text style={styles.statusText}>
          Backend: {error ? 'Desconectado' : 'Conectado'}
        </Text>
      </View>

      {/* Categorias */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryButton}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Loader ou lista de livros */}
      {(isLoading || isFetching) ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando livros...</Text>
        </View>
      ) : (
        <FlatList
          data={displayBooks}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.booksList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={60} color="#777" />
              <Text style={styles.emptyText}>
                {showSearch 
                  ? "Nenhum livro encontrado para esta busca" 
                  : selectedCategory 
                    ? "Nenhum livro encontrado nesta categoria"
                    : "Nenhum livro disponível"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: 'white',
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
  },
  booksList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  bookCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  bookCover: {
    width: '100%',
    height: 180,
    backgroundColor: '#3a3a4e',
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#bbb',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#777',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#472026',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
