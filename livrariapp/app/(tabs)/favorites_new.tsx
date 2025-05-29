import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Theme } from '../../constants/Theme';
import { useBiblioteca } from './_layout';
import { SavedBook } from '../../hooks/useUserLibraryService';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';

export default function FavoritesScreen() {
  const { favoritos, removeFromFavorites, user, isLoading, searchInFavorites, updateBookNotes } = useBiblioteca();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SavedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SavedBook | null>(null);
  const [bookNotes, setBookNotes] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = await searchInFavorites(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleRemoveFavorite = (bookId: string | number) => {
    Alert.alert(
      'Remover dos Favoritos',
      'Tem certeza que deseja remover este livro dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            removeFromFavorites(bookId);
          }
        }
      ]
    );
  };

  const handleOpenNotes = (book: SavedBook) => {
    setSelectedBook(book);
    setBookNotes(book.notes || '');
  };

  const handleSaveNotes = async () => {
    if (selectedBook) {
      await updateBookNotes(selectedBook.id, bookNotes);
      setSelectedBook(null);
      Alert.alert('Sucesso', 'Notas salvas com sucesso!');
    }
  };

  const handleViewDetails = (bookId: string | number) => {
    router.push({
      pathname: '/book-details',
      params: { id: String(bookId) }
    } as any);
  };

  const renderBookItem = ({ item }: { item: SavedBook }) => (
    <View style={styles.bookCard}>
      <Image 
        source={{ uri: item.cover || 'https://via.placeholder.com/150x200?text=Sem+Capa' }} 
        style={styles.bookCover} 
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author || 'Autor desconhecido'}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item.id)}
          >
            <Text style={styles.detailsButtonText}>Detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => handleOpenNotes(item)}
          >
            <Ionicons name="create-outline" size={12} color={Theme.colors.white} />
            <Text style={styles.notesButtonText}>Notas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Ionicons name="trash-outline" size={12} color={Theme.colors.white} />
            <Text style={styles.removeButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Minha Biblioteca" />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Theme.colors.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar na biblioteca..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={styles.loading} />
        ) : (
          <FlatList
            data={isSearching || searchResults.length > 0 ? searchResults : favoritos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderBookItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="library-outline" size={64} color={Theme.colors.secondary} />
                <Text style={styles.emptyText}>
                  {isSearching || searchQuery.trim() ? 
                    'Nenhum livro encontrado para esta pesquisa.' : 
                    'Você ainda não adicionou livros à sua biblioteca.'}
                </Text>
                {!isSearching && !searchQuery.trim() && (
                  <TouchableOpacity 
                    style={styles.exploreButton}
                    onPress={() => router.push('/discover' as any)}
                  >
                    <Text style={styles.exploreButtonText}>Explorar Livros</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
      
      {/* Modal para adicionar notas */}
      {selectedBook && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Adicionar Notas</Text>
            <Text style={styles.modalSubtitle}>{selectedBook.title}</Text>
            
            <TextInput
              style={styles.notesInput}
              placeholder="Adicione suas notas sobre este livro..."
              value={bookNotes}
              onChangeText={setBookNotes}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSelectedBook(null)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveNotes}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.medium,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.sm,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: Theme.borderRadius.small,
  },
  bookInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xxs,
  },
  bookAuthor: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.xs,
  },
  detailsButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.small,
    marginRight: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  detailsButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: '500',
  },
  notesButton: {
    backgroundColor: Theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.small,
    marginRight: Theme.spacing.xs,
    marginBottom: Theme.spacing.xs,
  },
  notesButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: '500',
    marginLeft: Theme.spacing.xxs,
  },
  removeButton: {
    backgroundColor: Theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.small,
    marginBottom: Theme.spacing.xs,
  },
  removeButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: '500',
    marginLeft: Theme.spacing.xxs,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  exploreButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
  },
  exploreButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.medium,
    paddingHorizontal: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: Theme.spacing.xs,
  },
  searchButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.large,
    padding: Theme.spacing.lg,
    width: '85%',
  },
  modalTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Theme.colors.tertiary,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.sm,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: Theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
  },
  cancelButtonText: {
    color: Theme.colors.secondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
  },
  saveButtonText: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
});
