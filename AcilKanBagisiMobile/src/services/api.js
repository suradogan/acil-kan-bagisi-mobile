import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API URL'i
// Farklı ortamlar için URLs
const possibleIPs = [
  "10.0.2.2", // Android emulator için
  "localhost",
  "127.0.0.1",
  "10.196.181.63", // Şu anki IP'niz 
  "192.168.1.104", // Yaygın yerel IP
  "192.168.0.104"  // Yaygın yerel IP
];

// Bağlantı testi yapan fonksiyon
const findWorkingAPI = async () => {
  for (const ip of possibleIPs) {
    const testUrl = `http://${ip}:8000/api`;
    try {
      console.log(`${testUrl} adresini test ediyorum...`);
      const response = await axios.get(`${testUrl}/users/test/`, {
        timeout: 3000 // Kısa bir timeout ile test et
      });
      
      if (response.status === 200) {
        console.log(`Çalışan API URL'i bulundu: ${testUrl}`);
        return testUrl;
      }
    } catch (error) {
      console.log(`${testUrl} bağlantı hatası:`, error.message);
    }
  }
  
  console.log("Çalışan bir API URL'i bulunamadı, mock API kullanılacak.");
  return null;
};

// API URL'ini belirle
let API_URL = "http://localhost:8000/api"; // Varsayılan URL

// API URL'ini başlangıçta ayarla
(async () => {
  const workingUrl = await findWorkingAPI();
  if (workingUrl) {
    API_URL = workingUrl;
  } else {
    // Mock API kullanılacak
    API_URL = "https://54b3-5-176-252-182.ngrok-free.app/api";  // Ngrok'tan aldığınız URL
  }
})();

// Token'ı async storage'a kaydetme
const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("@auth_token", token);
  } catch (error) {
    console.error("Token kaydedilirken hata oluştu:", error);
  }
};

// Token'ı async storage'dan getirme
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("@auth_token");
  } catch (error) {
    console.error("Token getirilirken hata oluştu:", error);
    return null;
  }
};

// Token'ı silme (çıkış yapma işlemi için)
const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("@auth_token");
  } catch (error) {
    console.error("Token silinirken hata oluştu:", error);
  }
};

// Kullanıcı bilgilerini kaydetme
const storeUser = async (user) => {
  try {
    await AsyncStorage.setItem("@user_info", JSON.stringify(user));
  } catch (error) {
    console.error("Kullanıcı bilgileri kaydedilirken hata oluştu:", error);
  }
};

// Kullanıcı bilgilerini getirme
const getUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem("@user_info");
    return userJson != null ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Kullanıcı bilgileri getirilirken hata oluştu:", error);
    return null;
  }
};

// Kullanıcı kaydı
const register = async (userData) => {
  try {
    console.log("API: Kayıt isteği gönderiliyor:", userData);
    console.log("API URL:", API_URL);
    console.log("Tam istek URL'i:", `${API_URL}/users/register/`);
    
    // API timeout süresini artıralım
    const response = await axios.post(`${API_URL}/users/register/`, userData, {
      timeout: 30000,  // 30 saniye
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log("API: Kayıt yanıtı:", response.data);
    
    if (response.data.user) {
      await storeUser(response.data.user);
      
      if (response.data.access) {
        await storeToken(response.data.access);
        return {
          user: response.data.user,
          token: response.data.access
        };
      }
    }
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      
      // Kullanıcı dostu hata mesajı döndür
      if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    } 
    
    throw new Error("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
};

// Kullanıcı girişi
const login = async (email, password) => {
  try {
    console.log("API: Giriş isteği gönderiliyor:", { email, password });
    const response = await axios.post(`${API_URL}/users/login/`, {
      email,
      password,
    });
    console.log("API: Giriş yanıtı:", response.data);
    
    if (response.data.access) {
      await storeToken(response.data.access);
      await storeUser(response.data.user);
      
      return {
        user: response.data.user,
        token: response.data.access
      };
    }
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Giriş sırasında bir hata oluştu");
  }
};

// Çıkış yapma
const logout = async () => {
  await removeToken();
  await AsyncStorage.removeItem("@user_info");
};

// Test için mock api
// Gerçek API test edilene kadar geçici olarak kullanılabilir
const mockRegister = async (userData) => {
  try {
    // Gerçek API yerine mock response döndürüyoruz
    console.log("MOCK: Register attempt with:", userData);
    
    const mockResponse = {
      user: {
        id: "mock-user-id",
        email: userData.email,
        full_name: userData.full_name,
        blood_type: userData.blood_type || "A+",
        city: userData.city || "İstanbul",
        district: userData.district || "Kadıköy",
        donation_count: 0,
        last_donation_date: null,
      },
      token: "mock-token-123456789"
    };
    
    await storeToken(mockResponse.token);
    await storeUser(mockResponse.user);
    
    return mockResponse;
  } catch (error) {
    throw new Error("Kayıt sırasında bir hata oluştu");
  }
};

const mockLogin = async (email, password) => {
  try {
    // Gerçek API yerine mock response döndürüyoruz
    console.log("MOCK: Login attempt with:", email, password);
    
    const mockResponse = {
      user: {
        id: "mock-user-id",
        email: email,
        full_name: "Test Kullanıcı",
        blood_type: "A+",
        city: "İstanbul",
        district: "Kadıköy",
        donation_count: 3,
        last_donation_date: "2025-01-15",
      },
      token: "mock-token-123456789"
    };
    
    await storeToken(mockResponse.token);
    await storeUser(mockResponse.user);
    
    return mockResponse;
  } catch (error) {
    throw new Error("Giriş sırasında bir hata oluştu");
  }
};

// Kullanıcı profilini güncelleme
const updateProfile = async (userData) => {
  try {
    // Mock veri dönüyoruz şimdilik
    console.log("MOCK: Profile update with:", userData);
    
    const user = await getUser();
    const updatedUser = { ...user, ...userData };
    
    await storeUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error("Profile update error:", error);
    throw new Error("Profil güncellenirken bir hata oluştu");
  }
};

// Kullanıcının bağışlarını getirme
const getUserDonations = async () => {
  try {
    // Mock veri dönüyoruz şimdilik
    console.log("MOCK: Getting user donations");
    
    const mockDonations = [
      {
        id: '1',
        date: '2023-05-15',
        donation_center: {
          name: 'Kızılay Kadıköy Kan Merkezi',
          address: 'Kadıköy, İstanbul',
        },
        quantity: 450,
        status: 'completed'
      },
      {
        id: '2',
        date: '2023-03-10',
        donation_center: {
          name: 'Özel Memorial Hastanesi',
          address: 'Ataşehir, İstanbul',
        },
        quantity: 450,
        status: 'completed'
      },
      {
        id: '3',
        date: '2023-01-05',
        donation_center: {
          name: 'Kızılay Üsküdar Kan Merkezi',
          address: 'Üsküdar, İstanbul',
        },
        quantity: 450,
        status: 'completed'
      }
    ];
    
    return mockDonations;
  } catch (error) {
    console.error("Get donations error:", error);
    throw new Error("Bağışlar getirilirken bir hata oluştu");
  }
};

// Yeni bağış kaydı oluşturma
const createDonation = async (donationData) => {
  try {
    // Mock yanıt dönüyoruz şimdilik
    console.log("MOCK: Creating donation:", donationData);
    
    return {
      id: Math.floor(Math.random() * 1000).toString(),
      ...donationData,
      status: 'completed',
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Create donation error:", error);
    throw new Error("Bağış kaydedilirken bir hata oluştu");
  }
};

// Bağış merkezlerini getirme
const getDonationCenters = async () => {
  try {
    // Mock veri dönüyoruz şimdilik
    console.log("MOCK: Getting donation centers");
    
    const mockCenters = [
      { id: '1', name: 'Kızılay Kadıköy Kan Merkezi', address: 'Kadıköy, İstanbul' },
      { id: '2', name: 'Özel Memorial Hastanesi', address: 'Ataşehir, İstanbul' },
      { id: '3', name: 'Kızılay Üsküdar Kan Merkezi', address: 'Üsküdar, İstanbul' },
      { id: '4', name: 'Devlet Hastanesi Kan Merkezi', address: 'Şişli, İstanbul' }
    ];
    
    return mockCenters;
  } catch (error) {
    console.error("Get donation centers error:", error);
    throw new Error("Bağış merkezleri getirilirken bir hata oluştu");
  }
};

// Acil talep oluşturma
const createEmergencyRequest = async (requestData) => {
  try {
    // Mock yanıt dönüyoruz şimdilik
    console.log("MOCK: Creating emergency request:", requestData);
    
    return {
      id: Math.floor(Math.random() * 1000).toString(),
      ...requestData,
      status: 'active',
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Create emergency request error:", error);
    throw new Error("Acil talep oluşturulurken bir hata oluştu");
  }
};

// Aktif acil talepleri getirme
const getActiveEmergencyRequests = async () => {
  try {
    // Mock veri dönüyoruz şimdilik
    console.log("MOCK: Getting active emergency requests");
    
    const mockRequests = [
      {
        id: '1',
        patient_name: 'Ahmet Yılmaz',
        blood_type: 'A+',
        hospital: 'İstanbul Tıp Fakültesi Hastanesi',
        city: 'İstanbul',
        district: 'Fatih',
        units_needed: 2,
        urgency_level: 3,
        phone_number: '555-123-4567',
        expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'active'
      },
      {
        id: '2',
        patient_name: 'Ayşe Demir',
        blood_type: 'O-',
        hospital: 'Acıbadem Hastanesi',
        city: 'İstanbul',
        district: 'Kadıköy',
        units_needed: 1,
        urgency_level: 2,
        phone_number: '555-987-6543',
        expires_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'active'
      }
    ];
    
    return mockRequests;
  } catch (error) {
    console.error("Get emergency requests error:", error);
    throw new Error("Acil talepler getirilirken bir hata oluştu");
  }
};

// API bağlantı testi
const testConnection = async () => {
  try {
    console.log("API: Bağlantı testi yapılıyor...");
    console.log("Test URL:", `${API_URL}/users/test/`);
    
    const response = await axios.get(`${API_URL}/users/test/`, {
      timeout: 15000  // 5000ms'den 15000ms'ye (15 saniye) yükselttik
    });
    
    console.log("API Test yanıtı:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Test hatası:", error);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Sunucu yanıt vermedi:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    
    throw new Error("API bağlantı testi başarısız: " + (error.message || "Bilinmeyen hata"));
  }
};

// Tüm bağış merkezlerini getirme
const getAllDonationCenters = async () => {
  if (USE_MOCK_API) {
    // Mock kan bağışı merkezleri
    console.log("MOCK: Getting all donation centers");
    return mockDonationCenters;
  }
  
  try {
    const response = await axios.get(`${API_URL}/donation/centers/`);
    return response.data;
  } catch (error) {
    console.error("Get donation centers error:", error);
    throw new Error("Bağış merkezleri getirilirken bir hata oluştu");
  }
};

// En yakın kan bağışı merkezlerini getirme
const getNearbyDonationCenters = async (latitude, longitude, radius = 10) => {
  if (USE_MOCK_API) {
    // Mock yakın kan bağışı merkezleri (mesafe eklenmiş)
    console.log("MOCK: Getting nearby donation centers");
    return mockDonationCenters.map(center => ({
      ...center,
      distance: (Math.random() * 10).toFixed(2) // Rastgele mesafe ekle
    })).sort((a, b) => a.distance - b.distance);
  }
  
  try {
    const response = await axios.get(`${API_URL}/donation/centers/nearby/`, {
      params: {
        latitude,
        longitude,
        radius
      }
    });
    return response.data;
  } catch (error) {
    console.error("Get nearby centers error:", error);
    throw new Error("Yakındaki bağış merkezleri getirilirken bir hata oluştu");
  }
};

// Mock kan bağışı merkezleri
const mockDonationCenters = [
  {
    id: 1,
    name: 'Kızılay Kadıköy Kan Merkezi',
    address: 'Caferağa, Mühürdar Cd. No:5, 34710 Kadıköy/İstanbul',
    city: 'İstanbul',
    district: 'Kadıköy',
    latitude: 40.9901,
    longitude: 29.0250,
    phone: '0216 414 01 01',
    working_hours: '09:00-17:00',
    is_active: true
  },
  {
    id: 2,
    name: 'Kızılay Fatih Kan Merkezi',
    address: 'Hırka-i Şerif, Darüşşafaka Cd. No:12, 34091 Fatih/İstanbul',
    city: 'İstanbul',
    district: 'Fatih',
    latitude: 41.0186,
    longitude: 28.9465,
    phone: '0212 631 22 80',
    working_hours: '09:00-17:00',
    is_active: true
  },
  {
    id: 3,
    name: 'Kızılay Bakırköy Kan Merkezi',
    address: 'Bakırköy, Zeytinlik, İncirli Cd. No:3, 34142 Bakırköy/İstanbul',
    city: 'İstanbul',
    district: 'Bakırköy',
    latitude: 40.9806,
    longitude: 28.8748,
    phone: '0212 543 10 00',
    working_hours: '09:00-17:00',
    is_active: true
  }
];

// Dışa aktarılan fonksiyonlar
export const api = {
  register,
  login,
  logout,
  getToken,
  getUser,
  testConnection,
  updateProfile,
  getUserDonations,
  createDonation,
  getDonationCenters,
  createEmergencyRequest,
  getActiveEmergencyRequests,
  getAllDonationCenters,
  getNearbyDonationCenters
};
