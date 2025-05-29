import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Theme } from '@/constants/Theme';
import { View } from 'react-native';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#493628" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: {
            backgroundColor: '#493628',
          },
        }}
      >
        <Stack.Screen
          name="login"
        />
        <Stack.Screen
          name="register"
        />
      </Stack>
    </View>
  );
}
