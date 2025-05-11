/**
 * Bildirim servisleri ve FCM (Firebase Cloud Messaging) entegrasyonu
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// FCM token'ı almak için kullanılacak istek başlıkları
export const initializeNotifications = async () => {
  try {
    // Bildirim izinlerini kontrol et
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // İzin yoksa iste
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // İzin alınamadıysa
    if (finalStatus !== 'granted') {
      console.log('Bildirim izni alınamadı!');
      return;
    }
    
    // Expo push token al
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    
    console.log('Expo Push Token:', expoPushToken);
    
    // Token'ı AsyncStorage'a kaydet
    await AsyncStorage.setItem('@notification_token', expoPushToken.data);
    
    // Backend'e token'ı gönder (eğer kullanıcı girişi yapılmışsa)
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      await registerDeviceToken(expoPushToken.data);
    }
    
    // Android için kanal oluştur
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    // Bildirim işleyicilerini ayarla
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    return expoPushToken.data;
  } catch (error) {
    console.error('Bildirimler başlatılırken hata:', error);
    return null;
  }
};

// Cihaz token'ını backend'e gönder
export const registerDeviceToken = async (token) => {
  try {
    await api.post('/users/device-token/', { token });
    return true;
  } catch (error) {
    console.error('Token kaydedilirken hata:', error);
    return false;
  }
};

// Tüm bildirimleri al
export const getNotifications = async (page = 1, limit = 10, unreadOnly = false) => {
  try {
    const response = await api.get('/notifications/', {
      params: { page, limit, unread_only: unreadOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Bildirimler alınırken hata:', error);
    return { results: [], count: 0 };
  }
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (notificationId) => {
  try {
    await api.post(`/notifications/${notificationId}/read/`);
    return true;
  } catch (error) {
    console.error('Bildirim okundu işaretlenirken hata:', error);
    return false;
  }
};

// Okunmamış bildirimleri kontrol et
export const checkUnreadNotifications = async () => {
  try {
    const response = await api.get('/notifications/', {
      params: { page: 1, limit: 1, unread_only: true }
    });
    return response.data.count;
  } catch (error) {
    console.error('Okunmamış bildirimler kontrol edilirken hata:', error);
    return 0;
  }
};

// Bildirim listenerini ayarla (ön planda gelen bildirimler için)
export const setupNotificationListeners = (onNotificationReceived) => {
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );
  
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    response => {
      const { notification } = response;
      // Bildirime tıklandığında işlem yapabilirsiniz
      console.log('Bildirime tıklandı:', notification);
    }
  );
  
  return {
    remove: () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    }
  };
}; 