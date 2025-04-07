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

// Dışa aktarılan fonksiyonlar
export const api = {
  register,
  login,
  logout,
  getToken,
  getUser,
  
  // Mock API fonksiyonları - API test edilene kadar kullanılabilir
  mockRegister,
  mockLogin
};
