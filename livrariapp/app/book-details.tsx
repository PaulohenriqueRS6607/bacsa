import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useLivrariaService } from '../hooks/useLivrariaService';
import { Theme } from '../constants/Theme';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import axios from 'axios';
// Importar serviço de favoritos
import useFavoritosService from '../hooks/useFavoritosService';
// Importar os livros mockados da página inicial e os dados mockados
import { MOMENT_BOOKS } from '../app/(tabs)/index';
import { mockBooksByCategory, MockBookItem } from '../data/mockBooks';

// Ampliar a interface MockBookItem para garantir que temos pageCount
type ExtendedMockBookItem = MockBookItem & {
  volumeInfo: {
    pageCount?: number;
    [key: string]: any;
  }
};

// Interface para representar a estrutura de dados da API Google Books
interface GoogleBookInfo {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    categories?: string[];
    language?: string;
    pageCount?: number;
  };
}

// Modificando a interface MockBookItem para incluir pageCount
interface ExtendedVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  publishedDate?: string;
  categories?: string[];
  language?: string;
  pageCount?: number;
}

// Definir a interface para o livro
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string | null;
  status?: 'available' | 'withdrawal' | 'rented';
  publishedDate: string;
  category?: string;
  categories?: string[];
  language: string;
  pageCount?: number;
  publisher?: string;
  price?: string | number;
  dueDate?: string;
}

const BookDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'staff' | 'admin'>('user');
  
  const { 
    fetchBookById, 
    rentBook, 
    returnBook, 
    cancelReservation,
    books,
  } = useLivrariaService();
  
  const [book, setBook] = useState<Book | null>(null);
  
  useEffect(() => {
    // Função para simular role do usuário (admin/user)
    setUserRole('user');
  }, []);
  
  // Função para remover tags HTML do texto
  const removeHtmlTags = (html: string | undefined): string => {
    if (!html) return '';
    // Remove todas as tags HTML
    const withoutTags = html.replace(/<[^>]*>/g, ' ');
    // Substitui entidades HTML comuns
    return withoutTags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  // Função para buscar livros por ID - utiliza várias fontes de dados
  const findBookByIdReference = async (bookId: string): Promise<Book | null> => {
    try {
      // 1. Verificar se é um dos IDs mockados conhecidos
      if (bookId === 'fantasy1') {
        console.log('Retornando livro mockado direto: fantasy1');
        return {
          id: 'fantasy1',
          title: 'Harry Potter e a Pedra Filosofal',
          author: 'J.K. Rowling',
          description: 'Harry Potter nunca tinha ouvido falar em Hogwarts até o momento em que as CARTAS começam a aparecer no capacho do número 4 da rua dos Alfeneiros.',
          cover: 'https://covers.openlibrary.org/b/id/10110415-L.jpg',
          status: 'available',
          publishedDate: '1997',
          category: 'Fantasia',
          language: 'pt-BR',
          pageCount: 223
        };
      }
      
      if (bookId === 'fantasy2') {
        console.log('Retornando livro mockado direto: fantasy2');
        return {
          id: 'fantasy2',
          title: 'O Senhor dos Anéis: A Sociedade do Anel',
          author: 'J.R.R. Tolkien',
          description: 'Em uma terra fantástica e única, um hobbit recebe de presente de seu tio um anel mágico e perigoso que precisa ser destruído antes que caia nas mãos do mal.',
          cover: 'https://covers.openlibrary.org/b/id/8743225-L.jpg',
          status: 'available',
          publishedDate: '1954',
          category: 'Fantasia',
          language: 'pt-BR',
          pageCount: 576
        };
      }
      
      if (bookId === 'fantasy3') {
        console.log('Retornando livro mockado direto: fantasy3');
        return {
          id: 'fantasy3',
          title: 'As Crônicas de Nárnia',
          author: 'C.S. Lewis',
          description: 'Quatro crianças descobrem um guarda-roupa que serve como porta de entrada para o mundo mágico de Nárnia.',
          cover: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
          status: 'available',
          publishedDate: '1950',
          category: 'Fantasia',
          language: 'pt-BR',
          pageCount: 208
        };
      }
      
      // 2. Tentar encontrar nos livros do momento
      const foundInMoment = MOMENT_BOOKS?.find((b: any) => String(b.id) === String(bookId));
      if (foundInMoment) {
        console.log('Livro encontrado nos MOMENT_BOOKS');
        return {
          id: foundInMoment.id,
          title: foundInMoment.title,
          author: foundInMoment.author,
          description: foundInMoment.description || 'Sem descrição disponível',
          cover: foundInMoment.cover || null,
          status: 'available',
          publishedDate: foundInMoment.publishedDate || '',
          language: 'pt-BR',
          pageCount: foundInMoment.pageCount || 0
        };
      }
      
      // 3. Procurar em todas as categorias mockadas
      for (const category in mockBooksByCategory) {
        const foundMock = mockBooksByCategory[category].find((b) => b.id === bookId) as ExtendedMockBookItem | undefined;
        if (foundMock && foundMock.volumeInfo) {
          console.log(`Livro encontrado na categoria mockada: ${category}`);
          return {
            id: foundMock.id,
            title: foundMock.volumeInfo.title,
            author: foundMock.volumeInfo.authors ? foundMock.volumeInfo.authors[0] : 'Autor não disponível',
            description: removeHtmlTags(foundMock.volumeInfo.description) || 'Sem descrição disponível',
            cover: foundMock.volumeInfo.imageLinks?.thumbnail || null,
            status: 'available',
            categories: foundMock.volumeInfo.categories,
            publishedDate: foundMock.volumeInfo.publishedDate || '',
            language: 'pt-BR',
            pageCount: foundMock.volumeInfo.pageCount || 0
          };
        }
      }
      
      // 4. Tentar buscar por API do Google Books se for um ID válido
      try {
        console.log('Tentando buscar por API do Google Books com ID:', bookId);
        // Acessar diretamente a API do Google Books
        const googleApiKey = 'AIzaSyBhxcAVrnA3YoF4bjRkWkLXSiFu12bjL3w';
        const googleResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`, {
          params: { key: googleApiKey }
        });
        
        if (googleResponse.data && googleResponse.data.volumeInfo) {
          const volumeInfo = googleResponse.data.volumeInfo;
          console.log('Livro encontrado na API do Google Books:', volumeInfo.title);
          return {
            id: bookId,
            title: volumeInfo.title || 'Título não disponível',
            author: volumeInfo.authors ? volumeInfo.authors[0] : 'Autor não disponível',
            description: volumeInfo.description || 'Sem descrição disponível',
            cover: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
            status: 'available',
            publishedDate: volumeInfo.publishedDate || '',
            language: volumeInfo.language || 'pt-BR',
            pageCount: volumeInfo.pageCount || 0,
            categories: volumeInfo.categories,
            publisher: volumeInfo.publisher
          };
        }
      } catch (apiError) {
        console.error('Erro ao buscar livro por API do Google Books:', apiError);
      }
      
      // 5. Retornar null quando não encontrar o livro específico
      console.warn('Não foi possível encontrar o livro específico');
      return null;
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        console.log('ID do livro recebido:', id, typeof id);
        
        if (!id || id === 'undefined' || id === 'null' || id === 'NaN') {
          setError('ID do livro não especificado ou inválido');
          setLoading(false);
          return;
        }
        
        // 1. Verificar diretamente os IDs mockados conhecidos
        if (id === 'fantasy1') {
          console.log('ID mockado encontrado: fantasy1');
          setBook({
            id: 'fantasy1',
            title: 'Harry Potter e a Pedra Filosofal',
            author: 'J.K. Rowling',
            description: 'Harry Potter nunca tinha ouvido falar em Hogwarts até o momento em que as CARTAS começam a aparecer no capacho do número 4 da rua dos Alfeneiros.',
            cover: 'https://covers.openlibrary.org/b/id/10110415-L.jpg',
            status: 'available',
            publishedDate: '1997',
            category: 'Fantasia',
            language: 'pt-BR',
            pageCount: 223
          });
          setLoading(false);
          return;
        }
        
        if (id === 'fantasy2') {
          console.log('ID mockado encontrado: fantasy2');
          setBook({
            id: 'fantasy2',
            title: 'O Senhor dos Anéis: A Sociedade do Anel',
            author: 'J.R.R. Tolkien',
            description: 'Em uma terra fantástica e única, um hobbit recebe de presente de seu tio um anel mágico e perigoso que precisa ser destruído antes que caia nas mãos do mal.',
            cover: 'https://covers.openlibrary.org/b/id/8743225-L.jpg',
            status: 'available',
            publishedDate: '1954',
            category: 'Fantasia',
            language: 'pt-BR',
            pageCount: 576
          });
          setLoading(false);
          return;
        }
        
        if (id === 'fantasy3') {
          console.log('ID mockado encontrado: fantasy3');
          setBook({
            id: 'fantasy3',
            title: 'As Crônicas de Nárnia',
            author: 'C.S. Lewis',
            description: 'Quatro crianças descobrem um guarda-roupa que serve como porta de entrada para o mundo mágico de Nárnia.',
            cover: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
            status: 'available',
            publishedDate: '1950',
            category: 'Fantasia',
            language: 'pt-BR',
            pageCount: 208
          });
          setLoading(false);
          return;
        }
        
        // 2. Verificar no array de livros carregados da API local
        const foundInApiBooks = books.find(b => String(b.id) === String(id));
        if (foundInApiBooks) {
          console.log('Livro encontrado nos dados da API local:', foundInApiBooks.title);
          setBook({
            id: String(foundInApiBooks.id),
            title: foundInApiBooks.title,
            author: foundInApiBooks.author || 'Autor não disponível',
            description: foundInApiBooks.description || 'Sem descrição disponível',
            cover: foundInApiBooks.cover || null,
            status: foundInApiBooks.status || 'available',
            publishedDate: foundInApiBooks.publishedDate || '',
            language: foundInApiBooks.language || 'pt-BR',
            pageCount: foundInApiBooks.pageCount || 0
          });
          setLoading(false);
          return;
        }
        
        // 3. Tentar buscar diretamente na API do Google Books
        try {
          console.log('Tentando buscar na API do Google Books com ID:', id);
          const googleApiKey = 'AIzaSyBhxcAVrnA3YoF4bjRkWkLXSiFu12bjL3w';
          const googleResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`, {
            params: { key: googleApiKey }
          });
          
          if (googleResponse.data && googleResponse.data.volumeInfo) {
            const volumeInfo = googleResponse.data.volumeInfo;
            console.log('Livro encontrado na API do Google Books:', volumeInfo.title);
            
            const bookData: Book = {
              id: String(id),
              title: volumeInfo.title || 'Título não disponível',
              author: volumeInfo.authors ? volumeInfo.authors[0] : 'Autor não disponível',
              description: removeHtmlTags(volumeInfo.description) || 'Sem descrição disponível',
              cover: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
              status: 'available' as 'available',
              publishedDate: volumeInfo.publishedDate || '',
              language: volumeInfo.language || 'pt-BR',
              pageCount: volumeInfo.pageCount || 0,
              categories: volumeInfo.categories,
              publisher: volumeInfo.publisher
            };
            
            setBook(bookData);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('Erro ao buscar livro na API do Google Books:', apiError);
        }
        
        // 4. Se não encontrou em nenhuma fonte, mostrar erro
        setError(`Livro com ID "${id}" não encontrado. Verifique se o ID está correto.`);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar detalhes do livro:', err);
        setError('Erro ao carregar detalhes do livro');
        setLoading(false);
      }
    };
    
    loadBook();
  }, [id, books, fetchBookById]);

  // Obter serviço de favoritos
  const { adicionarFavorito, isFavorito } = useFavoritosService();
  const [isSaved, setIsSaved] = useState(false);
  
  // Verificar se o livro já está nos favoritos
  useEffect(() => {
    if (book) {
      const checkFavorito = async () => {
        const favorito = await isFavorito(book.id);
        setIsSaved(favorito);
      };
      checkFavorito();
    }
  }, [book]);
  
  // Função para salvar o livro no banco de dados
  const handleRent = async () => {
    if (book) {
      try {
        // Criar objeto no formato esperado pela API do Google Books
        const googleBookFormat = {
          id: book.id,
          volumeInfo: {
            title: book.title,
            authors: [book.author],
            description: book.description,
            imageLinks: {
              thumbnail: book.cover || ''
            },
            publishedDate: book.publishedDate || '',
            categories: book.categories || [],
            language: book.language,
            pageCount: book.pageCount
          }
        };
        
        // Salvar no backend
        const success = await adicionarFavorito(googleBookFormat);
        
        if (success) {
          setIsSaved(true);
          Alert.alert(
            'Livro Salvo', 
            `"${book.title}" foi adicionado aos seus favoritos e salvo no banco de dados.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Erro', 
            'Não foi possível salvar o livro no banco de dados. Tente novamente mais tarde.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Erro ao salvar favorito:', error);
        Alert.alert(
          'Erro', 
          'Ocorreu um erro ao salvar o livro nos favoritos.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleCancel = () => {
    if (book) {
      // Converter o nosso tipo Book para o tipo esperado pela API
      const serviceBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        cover: book.cover || undefined,
        status: (book.status || 'available') as 'available' | 'withdrawal' | 'rented',
        publishedDate: book.publishedDate || '',
        category: book.category,
        categories: book.categories,
        language: book.language,
        pageCount: book.pageCount
      };
      cancelReservation(serviceBook);
      Alert.alert(
        'Reserva Cancelada', 
        `A reserva para "${book.title}" foi cancelada.`,
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleReturn = () => {
    if (book) {
      // Converter o nosso tipo Book para o tipo esperado pela API
      const serviceBook = {
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        cover: book.cover || undefined,
        status: (book.status || 'available') as 'available' | 'withdrawal' | 'rented',
        publishedDate: book.publishedDate || '',
        category: book.category,
        categories: book.categories,
        language: book.language,
        pageCount: book.pageCount
      };
      returnBook(serviceBook);
      Alert.alert(
        'Livro Devolvido', 
        `"${book.title}" foi devolvido à biblioteca.`,
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleEdit = () => {
    if (book) {
      router.push({
        pathname: '/(tabs)/books',
        params: { id: book.id }
      });
    }
  };
  
  const renderActionButtons = () => {
    if (!book) return null;
    
    // Por padrão, sempre mostrar o botão de Salvar
    return (
      <TouchableOpacity style={styles.actionButton} onPress={handleRent}>
        <Ionicons name="bookmark" size={24} color={Theme.colors.white} />
        <Text style={styles.actionButtonText}>Salvar</Text>
      </TouchableOpacity>
    );
    
    // Código comentado para referência futura
    /*
    switch (book.status) {
      case 'available':
        return (
          <TouchableOpacity style={styles.actionButton} onPress={handleRent}>
            <Ionicons name="bookmark" size={24} color={Theme.colors.white} />
            <Text style={styles.actionButtonText}>Salvar</Text>
          </TouchableOpacity>
        );
      case 'withdrawal':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
            <Ionicons name="close-circle" size={24} color={Theme.colors.white} />
            <Text style={styles.actionButtonText}>Cancelar Reserva</Text>
          </TouchableOpacity>
        );
      case 'rented':
        return (
          <TouchableOpacity style={[styles.actionButton, styles.returnButton]} onPress={handleReturn}>
            <Ionicons name="return-down-back" size={24} color={Theme.colors.white} />
            <Text style={styles.actionButtonText}>Devolver</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
    */
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes do Livro" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando detalhes do livro...</Text>
        </View>
        <Footer role={userRole} />
      </View>
    );
  }
  
  // Exibir tela de erro se houve um problema ou se não foi possível carregar o livro
  if (error || !book) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes do Livro" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Theme.colors.error} />
          <Text style={styles.errorText}>{error || 'Livro não encontrado'}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/books')}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <Footer role={userRole} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header title="Detalhes do Livro" />
      
      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.backButtonTop}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-circle" size={32} color={Theme.colors.primary} />
          <Text style={styles.backButtonTopText}>Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.bookHeader}>
          <Image 
            source={{ uri: book.cover || 'https://via.placeholder.com/150x200?text=No+Cover' }} 
            style={styles.coverImage} 
          />
          
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author || 'Autor desconhecido'}</Text>
          </View>
        </View>
        
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{book.description || 'Sem descrição disponível'}</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {renderActionButtons()}
        </View>
        
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gênero:</Text>
            <Text style={styles.detailValue}>{book.category || 'Não informado'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data de Publicação:</Text>
            <Text style={styles.detailValue}>
              {book.publishedDate 
                ? (isNaN(Date.parse(book.publishedDate)) ? book.publishedDate : new Date(book.publishedDate).toLocaleDateString())
                : 'Não informada'}
            </Text>
          </View>
          
          {book.publisher && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Editora:</Text>
              <Text style={styles.detailValue}>{book.publisher}</Text>
            </View>
          )}
          
          {book.pageCount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Páginas:</Text>
              <Text style={styles.detailValue}>{book.pageCount}</Text>
            </View>
          )}
          
          {book.language && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Idioma:</Text>
              <Text style={styles.detailValue}>{book.language}</Text>
            </View>
          )}
          
          {book.price !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preço:</Text>
              <Text style={styles.detailValue}>
                {typeof book.price === 'number' 
                ? `R$ ${book.price.toFixed(2)}` 
                : book.price && typeof book.price === 'string' && book.price.includes('R$') ? book.price : book.price ? `R$ ${book.price}` : 'Preço não disponível'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <Footer role={userRole} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.primary,
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  backButtonTopText: {
    marginLeft: Theme.spacing.sm,
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  errorText: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.error,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.medium,
  },
  backButtonText: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  bookHeader: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.lg,
  },
  coverImage: {
    width: 140,
    height: 200,
    borderRadius: Theme.borderRadius.medium,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  author: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.pill,
    marginRight: Theme.spacing.sm,
  },
  availableStatus: {
    backgroundColor: Theme.colors.success,
  },
  withdrawalStatus: {
    backgroundColor: Theme.colors.warning,
  },
  rentedStatus: {
    backgroundColor: Theme.colors.error,
  },
  statusText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.sm,
    marginLeft: 4,
  },
  detailsSection: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.medium,
    padding: Theme.spacing.md,
    ...Theme.shadow.light,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.text,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
  },
  detailLabel: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
    color: Theme.colors.primary,
    width: 150,
  },
  detailValue: {
    flex: 1,
    fontSize: Theme.typography.fontSizes.md,
    color: Theme.colors.text,
  },
  actionsContainer: {
    marginTop: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    ...Theme.shadow.medium,
  },
  cancelButton: {
    backgroundColor: Theme.colors.error,
  },
  returnButton: {
    backgroundColor: Theme.colors.success,
  },
  actionButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  rentedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.lightBackground,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: Theme.colors.warning,
  },
  rentedText: {
    color: Theme.colors.text,
    fontSize: Theme.typography.fontSizes.md,
    marginLeft: Theme.spacing.sm,
  },
});

export default BookDetailsScreen;