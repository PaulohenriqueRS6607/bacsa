import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada', headerShown: false }} />
      <View style={styles.container}>
        <Header title="Página não encontrada" />
        
        <View style={styles.content}>
          <Ionicons name="alert-circle-outline" size={80} color={Colors.light.tint} />
          <Text style={styles.title}>Esta página não existe</Text>
          <Text style={styles.subtitle}>O endereço que você tentou acessar não está disponível</Text>
          
          <Link href="/(tabs)/myBooks" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Voltar para a página inicial</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <Footer />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: 'white',
  },
});
