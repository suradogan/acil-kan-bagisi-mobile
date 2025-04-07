import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{
            title: "Acil Kan Bağışı",
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{
            title: "Giriş Yap",
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{
            title: "Kayıt Ol",
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="home" 
          options={{
            title: "Ana Sayfa",
            headerShown: true
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
