import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API URL'i
const API_URL = "http://10.0.2.2:8000/api"; // Android emülatör için

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
    const response = await axios.post(`${API_URL}/users/register/`, userData);
    console.log("API: Kayıt yanıtı:", response.data);
    
    if (response.data.user) {
      await storeUser(response.data.user);
      
      // Django'da token alabilmek için login endpoint'ine de istek atmalıyız
      if (response.data.access) {
        await storeToken(response.data.access);
        return {
          user: response.data.user,
          token: response.data.access
        };
      }
      
      // Access token yoksa login endpoint'ine istek at
      const loginResponse = await login(userData.email, userData.password);
      return loginResponse;
    }
    return response.data;
  } catch (error) {
    console.error("Register error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error("Kayıt sırasında bir hata oluştu");
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

// Dışa aktarılan fonksiyonlar
export const api = {
  register: mockRegister,
  login: mockLogin,
  logout,
  getToken,
  getUser,
  updateProfile,
  getUserDonations,
  createDonation,
  getDonationCenters,
  createEmergencyRequest,
  getActiveEmergencyRequests
};
