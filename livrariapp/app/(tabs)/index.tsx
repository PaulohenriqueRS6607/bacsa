import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Categorias de livros para navegar
const CATEGORIES = [
  { id: 'literature', name: 'Literatura', icon: 'book' },
  { id: 'academic', name: 'Acadêmicos', icon: 'school' },
  { id: 'science', name: 'Ciências', icon: 'flask' },
  { id: 'romance', name: 'Romance', icon: 'heart' },
];

// Interface para os livros do momento com informações completas
interface MomentBook {
  id: string;
  title: string;
  author: string;
  query: string;
  cover: string;
  description: string;
  publishedDate?: string;
  categories?: string[];
  language?: string;
  pageCount?: number;
}

// Livros do momento - lista de livros populares e variados com dados completos
// Exportando para uso em outras partes do app
export const MOMENT_BOOKS: MomentBook[] = [
  { 
    id: '1', 
    title: 'A Arte da Guerra', 
    author: 'Sun Tzu', 
    query: 'the art of war', 
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    description: 'A Arte da Guerra é um tratado militar escrito durante o século IV a.C. pelo estratégico chinês Sun Tzu. É reconhecido como um dos mais importantes tratados sobre estratégia e tática militar de todos os tempos.',
    publishedDate: '500 a.C.',
    categories: ['Estratégia', 'Filosofia'],
    language: 'pt-BR',
    pageCount: 288
  },
  { 
    id: '2', 
    title: 'Dom Casmurro', 
    author: 'Machado de Assis', 
    query: 'dom casmurro machado', 
    cover: 'https://covers.openlibrary.org/b/id/7680175-L.jpg',
    description: 'Publicado em 1899, Dom Casmurro é a obra-prima de Machado de Assis. O romance conta a história de Bentinho, que, enciumado, desconfia que sua esposa o havia traído com Escobar, seu melhor amigo.',
    publishedDate: '1899',
    categories: ['Romance', 'Literatura Brasileira'],
    language: 'pt-BR',
    pageCount: 256
  },
  { 
    id: '3', 
    title: 'O Pequeno Príncipe', 
    author: 'Antoine de Saint-Exupéry', 
    query: 'the little prince', 
    cover: 'https://covers.openlibrary.org/b/id/8091016-L.jpg',
    description: 'O Pequeno Príncipe é uma obra do escritor francês Antoine de Saint-Exupéry, que conta a história da amizade entre um homem frustrado por ninguém compreender seus desenhos e um principezinho que habita um asteroide do tamanho de uma casa.',
    publishedDate: '1943',
    categories: ['Infantil', 'Fantasia'],
    language: 'pt-BR',
    pageCount: 96
  },
  { 
    id: '4', 
    title: 'Orgulho e Preconceito', 
    author: 'Jane Austen', 
    query: 'pride and prejudice', 
    cover: 'https://covers.openlibrary.org/b/id/6749574-L.jpg',
    description: 'Orgulho e Preconceito é um romance da escritora britânica Jane Austen. Publicado em 1813, o livro segue a história de Elizabeth Bennet que vive com sua mãe, seu pai e suas irmãs em Hertfordshire, Inglaterra.',
    publishedDate: '1813',
    categories: ['Romance', 'Literatura Clássica'],
    language: 'pt-BR',
    pageCount: 432
  },
  { 
    id: '5', 
    title: '1984', 
    author: 'George Orwell', 
    query: '1984 orwell', 
    cover: 'https://covers.openlibrary.org/b/id/8575111-L.jpg',
    description: 'Winston Smith tenta manter a sanidade mental enquanto lida com o amor proibido, os constantes interrogatórios e a doutrinação. Um clássico da literatura que trata de temas como totalitarismo, vigilância maciça e repressão.',
    publishedDate: '1949',
    categories: ['Ficção Distópica', 'Política'],
    language: 'pt-BR',
    pageCount: 336
  },
  { 
    id: '6', 
    title: 'Cem Anos de Solidão', 
    author: 'Gabriel García Márquez', 
    query: 'one hundred years of solitude', 
    cover: 'https://covers.openlibrary.org/b/id/8701238-L.jpg',
    description: 'Cem Anos de Solidão narra a história da família Buendía ao longo de sete gerações, desde a fundação da fictícia cidade de Macondo, até sua destruição cem anos depois.',
    publishedDate: '1967',
    categories: ['Realismo Mágico', 'Literatura Latino-americana'],
    language: 'pt-BR',
    pageCount: 448
  },
  { 
    id: '7', 
    title: 'Harry Potter e a Pedra Filosofal', 
    author: 'J.K. Rowling', 
    query: 'harry potter philosopher stone', 
    cover: 'https://covers.openlibrary.org/b/id/10110415-L.jpg',
    description: 'Harry Potter nunca tinha ouvido falar em Hogwarts até que as cartas começam a chegar. Mas elas são interceptadas por seu térrível tio e tia. No seu aniversário de 11 anos, Rubéus Hagrid aparece com notícias surpreendentes: Harry Potter é um bruxo e tem uma vaga na Escola de Magia e Bruxaria de Hogwarts.',
    publishedDate: '1997',
    categories: ['Fantasia', 'Juvenil'],
    language: 'pt-BR',
    pageCount: 320
  },
  { 
    id: '8', 
    title: 'O Senhor dos Anéis: A Sociedade do Anel', 
    author: 'J.R.R. Tolkien', 
    query: 'lord of the rings', 
    cover: 'https://covers.openlibrary.org/b/id/8743225-L.jpg',
    description: 'Em uma terra fantástica e única, um hobbit recebe de presente de seu tio um anel mágico e perigoso que precisa ser destruído antes que caia nas mãos do mal. Para isso, o hobbit Frodo tem um caminho árduo pela frente, onde encontra perigo, medo e seres bizarros.',
    publishedDate: '1954',
    categories: ['Fantasia', 'Aventura'],
    language: 'pt-BR',
    pageCount: 576
  }
];

export default function HomeScreen() {
  // Estado para armazenar os livros selecionados aleatoriamente
  const [randomBooks, setRandomBooks] = React.useState<MomentBook[]>([]);
  
  // Selecionar livros aleatórios ao carregar a página
  React.useEffect(() => {
    // Embaralhar a lista de livros e pegar 4 aleatórios
    const shuffled = [...MOMENT_BOOKS].sort(() => 0.5 - Math.random());
    setRandomBooks(shuffled.slice(0, 4));
  }, []);
  
  // Função para navegar para a tela de perfil
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };
  
  // Função para navegar para a aba de livros com uma busca específica
  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/(tabs)/books',
      params: { category: categoryId }
    });
  };
  
  // Função para navegar para os detalhes de um livro com base na busca
  const handleBookPress = (book: MomentBook) => {
    // Navegar diretamente para a página de detalhes do livro usando o ID do livro
    router.push({
      pathname: '/book-details',
      params: { id: book.id }
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Livraria Digital</Text>
        <TouchableOpacity 
          style={styles.profileIconContainer}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <TouchableOpacity 
          style={styles.heroSection}
          onPress={() => router.push('/(tabs)/books')}
        >
          <Image 
            source={{
              uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
            }}
            style={styles.heroBanner}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Bem-vindo à Livraria Digital</Text>
            <Text style={styles.heroSubtitle}>Descubra novos mundos através da leitura</Text>
          </View>
        </TouchableOpacity>
        
        {/* Sobre Seção */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre Nossa Biblioteca</Text>
          <Text style={styles.sectionText}>
            Nossa biblioteca digital oferece acesso a milhares de livros para todos os gostos e idades. Com nosso sistema, você pode navegar pelo catálogo, reservar livros e gerenciar seus empréstimos de forma simples e rápida.
          </Text>
        </View>
        
        {/* Categorias Populares */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias Populares</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Ionicons name={category.icon as any} size={28} color="#493628" />
                <Text style={styles.categoryTitle}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Livros do Momento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Livros do Momento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {randomBooks.map((book) => (
              <TouchableOpacity 
                key={book.id}
                style={styles.featuredBook}
                onPress={() => handleBookPress(book)}
              >
                <View style={styles.bookCover}>
                  {book.cover ? (
                    <Image 
                      source={{ uri: book.cover }}
                      style={styles.coverImage}
                    />
                  ) : (
                    <Ionicons name="book-outline" size={40} color="#493628" />
                  )}
                </View>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>{book.author}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Novos estilos para as categorias
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#493628',
    marginTop: 8,
  },
  // Estilos para os livros em destaque
  horizontalScroll: {
    marginTop: 12,
  },
  featuredBook: {
    width: 140,
    marginRight: 16,
    alignItems: 'center',
  },
  bookCover: {
    width: 120,
    height: 160,
    backgroundColor: '#f0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#493628',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#493628',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
    height: 220,
  },
  heroBanner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(73, 54, 40, 0.7)',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#EEEEEE',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#493628',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
});
