import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';

interface Book {
  id: string;
  title: string;
  cover?: string;
  description: string;
  status: 'available' | 'withdrawal' | 'rented';
  author?: string;
  dueDate?: string;
  rentalDate?: string;
}

interface CardProps {
  book: Book;
  onRent?: (() => void) | null;
  onDispatch?: (() => void) | null;
  onCancel?: (() => void) | null;
  onReturn?: (() => void) | null;
  role?: 'admin' | 'staff' | 'user';
  showDetails?: boolean;
}

const Card = ({ book, onRent, onDispatch, onCancel, onReturn, role = 'user', showDetails = false }: CardProps) => {
  const [expanded, setExpanded] = useState(showDetails);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  // Get status color based on book status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return Theme.colors.success;
      case 'withdrawal':
        return Theme.colors.warning;
      case 'rented':
        return Theme.colors.error;
      default:
        return Theme.colors.secondary;
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand} style={styles.cardContainer}>
        <Image 
          source={{ uri: book.cover || 'https://via.placeholder.com/150x200?text=No+Cover' }} 
          style={styles.image} 
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
          {book.author && <Text style={styles.author}>{book.author}</Text>}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) }]}>
              <Text style={styles.statusText}>{book.status.toUpperCase()}</Text>
            </View>
            {book.dueDate && book.status === 'rented' && (
              <Text style={styles.dueDate}>Due: {book.dueDate}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
          <Ionicons 
            name={expanded ? 'chevron-up' as any : 'chevron-down' as any} 
            size={24} 
            color={Theme.colors.primary} 
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.descriptionTitle}>Description:</Text>
          <Text style={styles.description}>{book.description || 'No description available.'}</Text>
          
          <View style={styles.buttonContainer}>
            {onRent && book.status === 'available' && (
              <TouchableOpacity style={[styles.button, styles.rentButton]} onPress={onRent}>
                <Ionicons name="bookmark" size={18} color={Theme.colors.white} as any />
                <Text style={styles.buttonText}>Rent</Text>
              </TouchableOpacity>
            )}
            {onDispatch && book.status === 'withdrawal' && (
              <TouchableOpacity style={[styles.button, styles.dispatchButton]} onPress={onDispatch}>
                <Ionicons name="paper-plane" size={18} color={Theme.colors.white} as any />
                <Text style={styles.buttonText}>Dispatch</Text>
              </TouchableOpacity>
            )}
            {onCancel && book.status === 'withdrawal' && role === 'user' && (
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                <Ionicons name="close-circle" size={18} color={Theme.colors.white} as any />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            {onReturn && book.status === 'rented' && (role === 'staff' || role === 'admin') && (
              <TouchableOpacity style={[styles.button, styles.returnButton]} onPress={onReturn}>
                <Ionicons name="return-up-back" size={18} color={Theme.colors.white} as any />
                <Text style={styles.buttonText}>Return</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: Theme.borderRadius.medium,
    backgroundColor: Theme.colors.white,
    ...Theme.shadow.light,
  },
  cardContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 120,
    borderRadius: Theme.borderRadius.small,
  },
  contentContainer: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    justifyContent: 'space-between',
    height: 110,
  },
  title: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
    flexShrink: 1,
  },
  author: {
    color: Theme.colors.secondary,
    fontSize: Theme.typography.fontSizes.sm,
    marginBottom: Theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.pill,
  },
  statusText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.error,
    marginLeft: Theme.spacing.sm,
  },
  expandButton: {
    padding: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  expandedContent: {
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.tertiary,
  },
  descriptionTitle: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  description: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Theme.spacing.lg,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    marginLeft: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  buttonText: {
    color: Theme.colors.white,
    fontWeight: '600',
    marginLeft: Theme.spacing.xs,
  },
  rentButton: {
    backgroundColor: Theme.colors.primary,
  },
  dispatchButton: {
    backgroundColor: Theme.colors.warning,
  },
  cancelButton: {
    backgroundColor: Theme.colors.error,
  },
  returnButton: {
    backgroundColor: Theme.colors.success,
  },
});

export default Card; 