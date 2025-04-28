import { calculateDistance } from '../utils/geoUtils';
import { api } from './api';

/**
 * Verilen koordinatlara göre en yakın kan bağış merkezlerini getirir
 * @param {number} lat - Enlem
 * @param {number} lng - Boylam
 * @param {number} radius - Arama yarıçapı (km)
 * @param {number} limit - Maksimum merkez sayısı
 * @returns {Promise<Array>} - Sıralanmış ve mesafe bilgisi eklenmiş merkezler
 */
export const findNearbyDonationCenters = async (lat, lng, radius = 10, limit = 20) => {
  try {
    // Tüm merkezleri getir
    const centers = await api.getAllDonationCenters();
    
    // Her merkeze mesafe bilgisi ekle
    const centersWithDistance = centers.map(center => {
      const distance = calculateDistance(
        lat, lng,
        center.latitude, center.longitude
      );
      
      return {
        ...center,
        distance: parseFloat(distance.toFixed(2))
      };
    });
    
    // Belirli yarıçap içindeki merkezleri filtrele ve mesafeye göre sırala
    return centersWithDistance
      .filter(center => center.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  } catch (error) {
    console.error("Yakın merkez bulunamadı:", error);
    throw new Error("Yakındaki bağış merkezleri bulunamadı");
  }
}; 