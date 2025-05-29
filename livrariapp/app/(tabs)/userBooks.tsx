import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';
import Card from '../../components/layouts/Card';
import { useAuth } from './_layout';

interface Book {
  id: string;
  title: string;
  cover?: string;
  description: string;
  status: 'available' | 'withdrawal' | 'rented';
  author?: string;
  dueDate?: string;
  rentalDate?: string;
  category?: string;
}

type BookFilter = 'all' | 'withdrawal' | 'rented';

const UserBooksScreen = () => {
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BookFilter>('all');
  const { user } = useAuth();

  // Mock data for demonstration
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call to get user's books
    setTimeout(() => {
      const mockBooks: Book[] = [
        {
          id: 'book-1',
          title: 'O Hobbit',
          author: 'J.R.R. Tolkien',
          cover: 'https://m.media-amazon.com/images/I/91M9xPIf10L._AC_UF1000,1000_QL80_.jpg',
          description: 'Bilbo Bolseiro era um dos mais respeitáveis hobbits de todo o Condado até que, um dia, o mago Gandalf bate à sua porta.',
          status: 'rented',
          dueDate: '2025-06-15',
          rentalDate: '2025-05-15',
          category: 'Fiction'
        },
        {
          id: 'book-2',
          title: 'Dom Casmurro',
          author: 'Machado de Assis',
          cover: 'https://m.media-amazon.com/images/I/61x1ZSgEbwL._AC_UF1000,1000_QL80_.jpg',
          description: 'Obra-prima de Machado de Assis, Dom Casmurro é a história contada por Bento Santiago, o Bentinho, sobre sua vida, seus amores e suas suspeitas.',
          status: 'withdrawal',
          rentalDate: '2025-05-25',
          category: 'Classic'
        },
        {
          id: 'book-3',
          title: 'O Pequeno Príncipe',
          author: 'Antoine de Saint-Exupéry',
          cover: 'https://m.media-amazon.com/images/I/81fXBeYYxpL._AC_UF1000,1000_QL80_.jpg',
          description: 'Um piloto cai com seu avião no deserto do Saara e ali encontra uma criança loura e frágil. Ela diz ter vindo de um pequeno planeta distante.',
          status: 'rented',
          dueDate: '2025-06-10',
          rentalDate: '2025-05-10',
          category: 'Fiction'
        }
      ];
      
      setMyBooks(mockBooks);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter books based on status
  const filteredBooks = myBooks.filter(book => {
    if (activeFilter === 'all') return true;
    return book.status === activeFilter;
  });

  // Handle cancelling a book reservation
  const handleCancel = (book: Book) => {
    if (book.status === 'withdrawal') {
      setMyBooks(myBooks.filter(b => b.id !== book.id));
      Alert.alert('Reserva Cancelada', `Sua reserva para "${book.title}" foi cancelada.`);
    }
  };

  const renderFilterButton = (filter: BookFilter, label: string, icon: any) => (
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      <Ionicons name={icon} size={16} color={activeFilter === filter ? Theme.colors.white : Theme.colors.primary} />
      <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="My Books" showBackButton />
      
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', 'library')}
        {renderFilterButton('withdrawal', 'Reserved', 'hourglass')}
        {renderFilterButton('rented', 'Borrowed', 'bookmark')}
      </View>

      {loading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.statusText}>Loading your books...</Text>
        </View>
      ) : filteredBooks.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Ionicons name="book" size={64} color={Theme.colors.tertiary} />
          <Text style={styles.statusText}>
            {activeFilter === 'all' 
              ? 'You do not have any reserved or borrowed books.' 
              : activeFilter === 'withdrawal' 
                ? 'You do not have any reserved books at the moment.'
                : 'You do not have any borrowed books at the moment.'}
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/myBooks')}
          >
            <Text style={styles.browseButtonText}>Browse Books</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book found' : 'books found'}
          </Text>
          <FlatList
            data={filteredBooks}
            renderItem={({ item }) => (
              <Card
                book={item}
                onCancel={item.status === 'withdrawal' ? () => handleCancel(item) : null}
                role={(user?.role as 'admin' | 'staff' | 'user') || 'user'}
                showDetails
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
      
      <Footer role={(user?.role as 'admin' | 'staff' | 'user') || 'user'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    justifyContent: 'space-between',
    ...Theme.shadow.light,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  activeFilterButton: {
    backgroundColor: Theme.colors.primary,
  },
  filterText: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeFilterText: {
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
  browseButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.medium,
    marginTop: Theme.spacing.lg,
  },
  browseButtonText: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  resultCount: {
    padding: Theme.spacing.md,
    color: Theme.colors.secondary,
    fontSize: Theme.typography.fontSizes.sm,
  },
  listContainer: {
    padding: Theme.spacing.md,
    paddingBottom: 100, // Extra space at the bottom for footer
  },
});

export default UserBooksScreen;
