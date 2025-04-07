import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.auth.register(userData);
      
      if (response.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: response.error };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token != null;
    } catch (error) {
      return false;
    }
  }
};        