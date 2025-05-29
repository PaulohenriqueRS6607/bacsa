import React, { useEffect, useState, useCallback } from 'react';
import { useLivrariaService, Book } from '../../hooks/useLivrariaService';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import Card from '../../components/layouts/Card';
import Footer from '../../components/layouts/Footer';
import Header from '../../components/layouts/Header';
import { useLocalSearchParams } from 'expo-router';

// A interface Book é importada do hook useLivrariaService
// Para manter compatibilidade com o código existente, criamos uma versão local que estende a importada
interface LocalBook extends Book {
  id: string;
}

interface UserScreenProps {}

type BookCategory = 'all' | 'fiction' | 'science' | 'history' | 'biography' | 'technology';

const UserScreen = ({}: UserScreenProps) => {
  const params = useLocalSearchParams();
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<BookCategory>('all');
  const [searchQuery, setSearchQuery] = useState(params.search as string || '');
  const [myBooks, setMyBooks] = useState<LocalBook[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBook, setSelectedBook] = useState<LocalBook | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const itemsPerPage = 10;

  // Categories for book filtering
  const categories: { id: BookCategory; label: string; query: string }[] = [
    { id: 'all', label: 'Todos', query: 'subject:*' },
    { id: 'fiction', label: 'Ficção', query: 'subject:fiction' },
    { id: 'science', label: 'Ciência', query: 'subject:science' },
    { id: 'history', label: 'História', query: 'subject:history' },
    { id: 'biography', label: 'Biografia', query: 'subject:biography' },
    { id: 'technology', label: 'Tecnologia', query: 'subject:technology' },
  ];

  // Usar o hook personalizado para gerenciar os livros
  const { 
    books: serviceBooks, 
    myBooks: serviceMyBooks,
    loading: serviceLoading, 
    error: serviceError,
    fetchBooks: serviceFetchBooks,
    rentBook: serviceRentBook,
    cancelReservation: serviceCancelReservation
  } = useLivrariaService();
  
  const fetchBooks = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar usar a API local primeiro, com fallback para Google Books
      const category = activeCategory !== 'all' ? activeCategory : undefined;
      await serviceFetchBooks(searchQuery, category);
      
      // Atualizar o estado com os livros do serviço, convertendo IDs para string para compatibilidade
      setBooks(serviceBooks.map(book => ({
        ...book,
        id: String(book.id)
      })));
      
      // Para simplificar, usamos paginação fictícia na versão inicial
      setTotalItems(serviceBooks.length);
      setTotalPages(Math.ceil(serviceBooks.length / itemsPerPage));
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setError('Falha ao carregar livros. Por favor, tente novamente.');
      setLoading(false);
    }
  }, [activeCategory, searchQuery, itemsPerPage, serviceBooks, serviceFetchBooks]);

  useEffect(() => {
    setCurrentPage(0);
    fetchBooks(0);
  }, [activeCategory, searchQuery, fetchBooks]);

  const handleRent = (book: LocalBook) => {
    // Usar o serviço para alugar o livro
    serviceRentBook(book);
    
    // Atualizar a interface
    setBooks(books.map(b => b.id === book.id ? { ...b, status: 'withdrawal' } : b));
    setMyBooks([...myBooks, {...book, status: 'withdrawal', rentalDate: new Date().toISOString().split('T')[0]}]);
    
    // Show success message
    Alert.alert(
      'Livro Reservado', 
      `"${book.title}" foi reservado. Por favor, visite a biblioteca para retirá-lo. Ele será mantido por 48 horas.`,
      [{ text: 'OK' }]
    );
  };

  const handleCancel = (book: LocalBook) => {
    // Usar o serviço para cancelar a reserva
    serviceCancelReservation(book);
    
    // Atualizar a interface
    setBooks(books.map(b => b.id === book.id ? { ...b, status: 'available' } : b));
    setMyBooks(myBooks.filter(b => b.id !== book.id));
    
    Alert.alert('Reserva Cancelada', `Sua reserva para "${book.title}" foi cancelada.`);
  };

  const handleViewBook = (book: LocalBook) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBooks(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const showEllipsisBefore = currentPage > 3;
    const showEllipsisAfter = currentPage < totalPages - 4;
    
    // First page
    pageNumbers.push(0);
    
    // Pages before current
    if (showEllipsisBefore) {
      pageNumbers.push(-1); // Ellipsis placeholder
    } else {
      for (let i = 1; i < currentPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    // Current and surrounding pages
    for (let i = Math.max(1, currentPage); i <= Math.min(currentPage + 2, totalPages - 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Pages after current
    if (showEllipsisAfter) {
      pageNumbers.push(-2); // Ellipsis placeholder
    } else {
      for (let i = currentPage + 3; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    
    // Last page
    if (!pageNumbers.includes(totalPages - 1) && totalPages > 1) {
      pageNumbers.push(totalPages - 1);
    }
    
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[styles.paginationButton, currentPage === 0 && styles.disabledButton]}
          onPress={() => currentPage > 0 && handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? Theme.colors.tertiary : Theme.colors.primary} as any />
        </TouchableOpacity>
        
        <View style={styles.paginationNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === -1 || page === -2) {
              return (
                <Text key={`ellipsis-${index}`} style={styles.ellipsis}>...</Text>
              );
            }
            
            return (
              <TouchableOpacity 
                key={page}
                style={[
                  styles.pageNumber, 
                  page === currentPage && styles.currentPage
                ]}
                onPress={() => handlePageChange(page)}
              >
                <Text 
                  style={[
                    styles.pageNumberText, 
                    page === currentPage && styles.currentPageText
                  ]}
                >
                  {page + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <TouchableOpacity 
          style={[styles.paginationButton, currentPage === totalPages - 1 && styles.disabledButton]}
          onPress={() => currentPage < totalPages - 1 && handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages - 1 ? Theme.colors.tertiary : Theme.colors.primary} as any />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryButton = (category: { id: BookCategory; label: string }) => (
    <TouchableOpacity 
      key={category.id}
      style={[styles.categoryButton, activeCategory === category.id && styles.activeCategoryButton]}
      onPress={() => setActiveCategory(category.id)}
    >
      <Text 
        style={[styles.categoryButtonText, 
        activeCategory === category.id && styles.activeCategoryButtonText]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Biblioteca" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Theme.colors.secondary} as any />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar livros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Theme.colors.secondary} as any />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categories.map(category => renderCategoryButton(category))}
        </ScrollView>
      </View>
      
      {/* Book List */}
      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.statusText}>Carregando livros...</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle" size={40} color={Theme.colors.error} as any />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : books.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Ionicons name="book" size={40} color={Theme.colors.tertiary} as any />
          <Text style={styles.statusText}>Nenhum livro encontrado para sua busca.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={books}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleViewBook(item)}>
                <Card
                  book={item}
                  onRent={item.status === 'available' ? () => handleRent(item) : null}
                  onCancel={item.status === 'withdrawal' ? () => handleCancel(item) : null}
                  role="user"
                  showDetails={false}
                />
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={renderPagination}
          />
        </>
      )}
      
      {/* Book Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Theme.colors.primary} as any />
            </TouchableOpacity>
            
            {selectedBook && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.bookHeader}>
                  <Image 
                    source={{ uri: selectedBook.cover || 'https://via.placeholder.com/150x200?text=No+Cover' }}
                    style={styles.modalCover}
                  />
                  <View style={styles.bookHeaderInfo}>
                    <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                    <Text style={styles.modalAuthor}>{selectedBook.author}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {selectedBook.status === 'available' ? 'Disponível' : 
                         selectedBook.status === 'withdrawal' ? 'Reservado' : 'Emprestado'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.bookDetails}>
                  <Text style={styles.sectionTitle}>Descrição</Text>
                  <Text style={styles.descriptionText}>{selectedBook.description}</Text>
                  
                  <Text style={styles.sectionTitle}>Informações</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Editora:</Text>
                    <Text style={styles.infoValue}>{selectedBook.publisher || 'Não informado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Data de Publicação:</Text>
                    <Text style={styles.infoValue}>{selectedBook.publishedDate || 'Não informada'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Páginas:</Text>
                    <Text style={styles.infoValue}>{selectedBook.pageCount || 'Não informado'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Idioma:</Text>
                    <Text style={styles.infoValue}>{selectedBook.language}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Categorias:</Text>
                    <Text style={styles.infoValue}>{selectedBook.category}</Text>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  {selectedBook.status === 'available' ? (
                    <TouchableOpacity 
                      style={styles.rentButton}
                      onPress={() => {
                        handleRent(selectedBook);
                        setModalVisible(false);
                      }}
                    >
                      <Ionicons name="bookmark" size={18} color="white" as any />
                      <Text style={styles.actionButtonText}>Reservar</Text>
                    </TouchableOpacity>
                  ) : selectedBook.status === 'withdrawal' ? (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        handleCancel(selectedBook);
                        setModalVisible(false);
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color="white" as any />
                      <Text style={styles.actionButtonText}>Cancelar Reserva</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      <Footer role="user" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  searchContainer: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.tertiary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.medium,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.md,
    height: 40,
  },
  categoriesContainer: {
    backgroundColor: Theme.colors.white,
    paddingVertical: Theme.spacing.sm,
    ...Theme.shadow.light,
  },
  categoriesScrollContent: {
    paddingHorizontal: Theme.spacing.md,
  },
  categoryButton: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    marginRight: Theme.spacing.md,
  },
  activeCategoryButton: {
    backgroundColor: Theme.colors.primary,
  },
  categoryButtonText: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: '500',
  },
  activeCategoryButtonText: {
    color: Theme.colors.white,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  statusText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.secondary,
    fontSize: Theme.typography.fontSizes.md,
    textAlign: 'center',
  },
  errorText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.error,
    fontSize: Theme.typography.fontSizes.md,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: Theme.spacing.md,
    paddingBottom: 80, // Extra padding for pagination
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.medium,
    margin: Theme.spacing.md,
    ...Theme.shadow.light,
  },
  paginationButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumber: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  currentPage: {
    backgroundColor: Theme.colors.primary,
  },
  pageNumberText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.primary,
  },
  currentPageText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
  },
  ellipsis: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.secondary,
    marginHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.md,
    ...Theme.shadow.medium,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Theme.spacing.xs,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  bookHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.md,
  },
  modalCover: {
    width: 120,
    height: 180,
    borderRadius: Theme.borderRadius.small,
  },
  bookHeaderInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  modalAuthor: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.sm,
  },
  statusBadge: {
    backgroundColor: Theme.colors.success,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  bookDetails: {
    marginTop: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  descriptionText: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.secondary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xs,
  },
  infoLabel: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
    color: Theme.colors.primary,
    width: 150,
  },
  infoValue: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.secondary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  rentButton: {
    backgroundColor: Theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
  },
  cancelButton: {
    backgroundColor: Theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
  },
  actionButtonText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: Theme.typography.fontSizes.md,
    marginLeft: Theme.spacing.xs,
  },
});

export default UserScreen;