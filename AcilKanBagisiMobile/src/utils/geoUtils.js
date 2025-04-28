/**
 * İki koordinat noktası arasındaki mesafeyi hesaplar (Haversine formülü)
 * @param {number} lat1 - İlk noktanın enlemi
 * @param {number} lon1 - İlk noktanın boylamı
 * @param {number} lat2 - İkinci noktanın enlemi
 * @param {number} lon2 - İkinci noktanın boylamı
 * @returns {number} - İki nokta arasındaki mesafe (km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Dereceyi radyana çevirir
 * @param {number} degree - Derece
 * @returns {number} - Radyan
 */
const toRad = (degree) => {
  return degree * Math.PI / 180;
}; 