import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BibliotecaContext, SavedBook } from './_layout';

const FavoritesScreen = () => {
  const { isAuthenticated, favoritos, removeFromFavorites, searchInFavorites } = useContext(BibliotecaContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SavedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    
    try {
      const results = await searchInFavorites(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
      setIsSearching(true);
    }
  };

  const handleRemoveFromFavorites = (bookId: string | number) => {
    Alert.alert(
      'Remover dos favoritos',
      'Tem certeza que deseja remover este livro dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeFromFavorites(bookId);
              if (success) {
                // Atualizar os resultados da busca se estiver buscando
                if (isSearching && searchQuery.trim()) {
                  handleSearch();
                }
              }
            } catch (error) {
              console.error('Erro ao remover dos favoritos:', error);
              Alert.alert('Erro', 'Não foi possível remover o livro dos favoritos. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const navigateToBookDetails = (bookId: string | number) => {
    router.push({
      pathname: '/book-details',
      params: { id: String(bookId) }
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const booksToShow = isSearching ? searchResults : favoritos;

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
        <Text style={styles.messageText}>Redirecionando para o login...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Favoritos</Text>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar nos favoritos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#6200ea" />
          <Text style={styles.messageText}>Buscando livros...</Text>
        </View>
      ) : booksToShow.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {isSearching 
              ? 'Nenhum livro encontrado para esta busca.' 
              : 'Você ainda não adicionou livros aos favoritos.'}
          </Text>
          {isSearching && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Limpar busca</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.booksContainer}>
          {booksToShow.map(book => (
            <TouchableOpacity
              key={book.id}
              style={styles.bookCard}
              onPress={() => navigateToBookDetails(book.id)}
            >
              <View style={styles.bookCover}>
                {book.cover ? (
                  <Image 
                    source={{ uri: book.cover }}
                    style={styles.bookCoverImage}
                  />
                ) : (
                  <View style={styles.bookCoverPlaceholder}>
                    <Ionicons name="book-outline" size={30} color="#6200ea" />
                  </View>
                )}
              </View>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                <Text style={styles.savedDate}>
                  Adicionado em: {new Date(book.savedAt).toLocaleDateString()}
                </Text>
                {book.notes && (
                  <Text style={styles.bookNotes} numberOfLines={2}>
                    Nota: {book.notes}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromFavorites(book.id)}
              >
                <Ionicons name="heart-dislike" size={24} color="#f44336" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#6200ea',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  booksContainer: {
    padding: 16,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookCover: {
    width: 80,
    height: 120,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  bookCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  savedDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  bookNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
  removeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  clearSearchButton: {
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#6200ea',
    fontWeight: '600',
  },
});

export default FavoritesScreen;
