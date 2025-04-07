import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_info');
        const storedToken = await AsyncStorage.getItem('@auth_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
      }
    };
    
    loadStorageData();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Trying to login with:', { email, password });
      
      // Call the API login function
      const response = await api.login(email, password);
      
      // Store user data and token
      setUser(response.user);
      setToken(response.token);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Registering with data:', userData);
      
      // Call the API register function
      const response = await api.register(userData);
      
      // Store user data and token
      setUser(response.user);
      setToken(response.token);
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Kayıt olurken bir hata oluştu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the API logout function
      await api.logout();
      
      // Reset state
      setUser(null);
      setToken(null);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
