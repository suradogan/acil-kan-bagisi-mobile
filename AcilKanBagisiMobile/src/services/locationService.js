/**
 * Konum servisleri ve harita işlevleri için yardımcı fonksiyonlar
 */
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import api from './api';

/**
 * Kullanıcının mevcut konumunu alır
 * @returns {Promise<{latitude: number, longitude: number}|null>} Konum bilgisi veya hata durumunda null
 */
export const getCurrentLocation = async () => {
  try {
    // Konum izni iste
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Konum İzni Gerekli',
        'Yakınınızdaki kan bağış merkezlerini görebilmek için konum izni vermeniz gerekmektedir.',
        [{ text: 'Tamam' }]
      );
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Konum alınamadı:', error);
    return null;
  }
};

/**
 * İki konum arasındaki mesafeyi hesaplar (km cinsinden)
 * @param {number} lat1 - İlk konumun enlemi
 * @param {number} lon1 - İlk konumun boylamı  
 * @param {number} lat2 - İkinci konumun enlemi
 * @param {number} lon2 - İkinci konumun boylamı
 * @returns {number} İki konum arasındaki mesafe (km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Kilometre cinsinden mesafe
  
  return Math.round(distance * 10) / 10; // Bir ondalık basamağa yuvarla
};

/**
 * Verilen konuma en yakın hastaneleri bulur
 * @param {Object} location - Kullanıcının konumu {latitude, longitude}
 * @param {number} radius - Kilometre cinsinden yarıçap (varsayılan: 10km)
 * @returns {Promise<Array>} Yakındaki hastanelerin listesi
 */
export const findNearbyHospitals = async (location, radius = 10) => {
  try {
    if (!location) return [];
    
    // API'dan tüm hastaneleri al
    const response = await api.get('/hospitals/');
    const hospitals = response.data;
    
    // Her hastane için mesafeyi hesapla
    const hospitalsWithDistance = hospitals.map(hospital => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        hospital.latitude,
        hospital.longitude
      );
      
      return {
        ...hospital,
        distance
      };
    });
    
    // Belirtilen yarıçap içindeki hastaneleri filtrele ve mesafeye göre sırala
    return hospitalsWithDistance
      .filter(hospital => hospital.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
      
  } catch (error) {
    console.error('Yakındaki hastaneler alınamadı:', error);
    return [];
  }
};

/**
 * Google Maps ile yol tarifi URL'si oluşturur
 * @param {Object} destination - Hedef konum {latitude, longitude}
 * @returns {string} Google Maps yol tarifi URL'si
 */
export const getDirectionsUrl = (destination) => {
  if (!destination) return '';
  
  return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
};

/**
 * Adres bilgisini formatlar
 * @param {Object} hospital - Hastane bilgisi
 * @returns {string} Formatlanmış adres
 */
export const formatAddress = (hospital) => {
  if (!hospital) return '';
  
  return `${hospital.address}, ${hospital.district}, ${hospital.city}`;
}; 