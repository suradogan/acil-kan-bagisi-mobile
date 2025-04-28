import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';

export default function RootLayout() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'white' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen 
            name="emergency-request" 
            options={{ 
              headerShown: true,
              title: "Acil Kan İhtiyacı" 
            }} 
          />
          <Stack.Screen 
            name="add-donation" 
            options={{ 
              headerShown: true,
              title: "Kan Bağışı Ekle" 
            }} 
          />
        </Stack>
      </AuthProvider>
    </NavigationContainer>
  );
}
