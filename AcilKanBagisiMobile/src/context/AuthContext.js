import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import * as notificationService from '../services/notificationService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_info');
        const storedToken = await AsyncStorage.getItem('@auth_token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          
          // Bildirimleri başlat
          initializeNotifications();
        }
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
      }
    };
    
    loadStorageData();
  }, []);
  
  // Bildirimleri başlatma ve takip etme fonksiyonu
  const initializeNotifications = async () => {
    try {
      // Bildirim servisini başlat ve cihaz token'ını al
      const deviceToken = await notificationService.initializeNotifications();
      
      if (deviceToken) {
        // Bildirimleri dinlemek için listener ekle
        const listeners = notificationService.setupNotificationListeners(
          (notification) => {
            // Yeni bildirim geldiğinde sayacı güncelle
            checkUnreadNotifications();
          }
        );
        
        // Okunmamış bildirimleri kontrol et
        checkUnreadNotifications();
        
        // Component unmount olduğunda listener'ları temizle
        return () => listeners.remove();
      }
    } catch (error) {
      console.error('Bildirim servisi başlatılırken hata:', error);
    }
  };
  
  // Okunmamış bildirimleri kontrol et
  const checkUnreadNotifications = async () => {
    if (token) {
      const count = await notificationService.checkUnreadNotifications();
      setNotificationCount(count);
    }
  };

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
      
      // Bildirimleri başlat
      initializeNotifications();
      
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
      
      // Bildirimleri başlat
      initializeNotifications();
      
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
      setNotificationCount(0);
      
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
        notificationCount,
        checkUnreadNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
