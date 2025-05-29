import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useFavoritosService from '../../hooks/useFavoritosService';
import { BookItem } from '../BooksApiService';

const FavoritesBackendScreen = () => {
  const { 
    favoritos, 
    isLoading, 
    error, 
    removerFavorito, 
    atualizarFavoritos,
    sincronizar
  } = useFavoritosService();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Função para realizar a busca nos favoritos
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    
    const results = favoritos.filter(book => {
      const title = book.volumeInfo.title?.toLowerCase() || '';
      const author = book.volumeInfo.authors?.join(' ').toLowerCase() || '';
      const description = book.volumeInfo.description?.toLowerCase() || '';
      
      return title.includes(query) || 
             author.includes(query) || 
             description.includes(query);
    });
    
    setSearchResults(results);
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Função para atualizar a lista de favoritos
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await sincronizar();
    } catch (error) {
      console.error('Erro ao sincronizar favoritos:', error);
      Alert.alert('Erro', 'Não foi possível sincronizar seus favoritos. Tente novamente.');
    } finally {
      setRefreshing(false);
    }
  };

  // Função para remover um livro dos favoritos
  const handleRemoveFavorite = async (bookId: string, title: string) => {
    Alert.alert(
      'Remover dos favoritos',
      `Deseja remover "${title}" dos seus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removerFavorito(bookId);
              Alert.alert('Sucesso', 'Livro removido dos favoritos');
            } catch (error) {
              console.error('Erro ao remover favorito:', error);
              Alert.alert('Erro', 'Não foi possível remover o livro. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  // Renderizar item da lista de favoritos
  const renderBookItem = ({ item }: { item: BookItem }) => {
    const title = item.volumeInfo.title || 'Sem título';
    const author = item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Autor desconhecido';
    const coverUrl = item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Sem+Capa';
    
    return (
      <View style={styles.bookCard}>
        <TouchableOpacity
          style={styles.bookContent}
          onPress={() => router.push(`/book-details?id=${item.id}`)}
        >
          <Image
            source={{ uri: coverUrl }}
            style={styles.bookCover}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{author}</Text>
            <Text style={styles.bookDate} numberOfLines={1}>
              {item.volumeInfo.publishedDate || 'Data desconhecida'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id, title)}
        >
          <Ionicons name="heart-dislike" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  // Lista vazia
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>
        {isSearching 
          ? "Nenhum resultado encontrado" 
          : "Você ainda não tem favoritos"}
      </Text>
      {isSearching && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearSearch}
        >
          <Text style={styles.clearButtonText}>Limpar busca</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Mostrar mensagem de erro se existir
  if (error && !isLoading && favoritos.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView edges={['top']} style={{flex: 1}}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Meus Favoritos</Text>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={sincronizar}
            >
              <Ionicons name="sync" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline" size={60} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={atualizarFavoritos}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={{flex: 1}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Favoritos</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={sincronizar}
              disabled={isLoading}
            >
              <Ionicons name="sync" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#777" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar nos favoritos..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#777" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        
        {/* Status da sincronização */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: error ? '#e74c3c' : '#2ecc71' }
          ]} />
          <Text style={styles.statusText}>
            {error 
              ? 'Desconectado do backend (usando dados locais)' 
              : 'Conectado ao backend'
            }
          </Text>
        </View>
        
        {/* Lista de favoritos */}
        <FlatList
          data={isSearching ? searchResults : favoritos}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3498db']}
              tintColor="#3498db"
            />
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  syncButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookContent: {
    flex: 1,
    flexDirection: 'row',
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
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
    marginBottom: 4,
  },
  bookDate: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3498db',
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3498db',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FavoritesBackendScreen;
