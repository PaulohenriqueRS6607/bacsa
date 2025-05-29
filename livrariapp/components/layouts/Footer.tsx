import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FooterProps {
  role?: 'admin' | 'staff' | 'user';
  navigation?: any;
}

const Footer = ({ role = 'user' }: FooterProps) => {
  // Obtendo os insets de área segura para trabalhar melhor com diferentes dispositivos
  const insets = useSafeAreaInsets();
  
  // Implementando uma função de navegação utilizando apenas o expo-router
  const navigateTo = (screen: string) => {
    try {
      // Usando tipos corretos para as rotas do expo-router
      switch (screen) {
        case '/':
          router.push('/');
          break;
        case '/books':
          router.push('/books' as const);
          break;
        case '/salvos':
          router.push('/backend-books' as const);
          break;
        default:
          console.log('Rota não encontrada');
      }
    } catch (error) {
      console.log('Erro na navegação:', error);
    }
  };
  
  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateTo('/')}
        >
          <Ionicons name="home" size={24} color="#ffffff" />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateTo('/books')}
        >
          <Ionicons name="book" size={24} color="#ffffff" />
          <Text style={styles.navText}>Livros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigateTo('/salvos')}
        >
          <Ionicons name="save" size={24} color="#ffffff" />
          <Text style={styles.navText}>Salvos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: { 
    backgroundColor: '#493628',
    paddingTop: 8,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 1000,
    // Posicionamento consistente com a tela de livros
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 52,
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
    paddingTop: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    flex: 1,
    height: '100%',
    marginHorizontal: 2,
  },
  navText: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  copyright: { 
    color: Theme.colors.white, 
    textAlign: 'center',
    fontSize: Theme.typography.fontSizes.xs,
    marginTop: Theme.spacing.sm,
  },
});

export default Footer;