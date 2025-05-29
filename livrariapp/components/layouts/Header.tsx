import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import { router } from 'expo-router';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showProfileButton?: boolean;
  showLoginButton?: boolean;
  role?: 'admin' | 'staff' | 'user';
}

const Header = ({ title, showBackButton = false, showProfileButton = true, showLoginButton = false, role = 'user' }: HeaderProps) => {
  const handleBackPress = () => {
    router.back();
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile' as any);
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.header}>
      <StatusBar backgroundColor={Theme.colors.primary} barStyle="light-content" />
      <View style={styles.container}>
        {showBackButton && (
          <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={Theme.colors.white} />
          </TouchableOpacity>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        {showProfileButton && (
          <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
            <Ionicons name="person-circle" size={28} color={Theme.colors.white} />
          </TouchableOpacity>
        )}
        
        {showLoginButton && (
          <TouchableOpacity style={styles.iconButton} onPress={handleLoginPress}>
            <Ionicons name="log-in-outline" size={24} color={Theme.colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { 
    backgroundColor: Theme.colors.primary, 
    paddingTop: Platform.OS === 'android' ? 30 : 0, // Valor fixo para a altura da status bar no Android
    paddingHorizontal: Theme.spacing.md,
    ...Theme.shadow.medium
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5, // Adicionando um pequeno espaçamento extra no topo
  },
  title: { 
    color: Theme.colors.white, 
    fontSize: Theme.typography.fontSizes.xl, 
    fontWeight: '600',
    flex: 1,
    textAlign: 'center' 
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default Header;