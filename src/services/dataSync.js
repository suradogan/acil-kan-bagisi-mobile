import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { authAPI, getAuthHeaders } from './api';
import MongoDBConfig from '../config/mongoConfig';

class DataSyncService {
  constructor() {
    this.initialized = false;
    this.isOnline = true;
    this.pendingOperations = [];
    this.syncInProgress = false;
    this.networkListeners = [];
    this.lastSyncDate = null;
    this.deviceId = null;
  }

  // Servisi başlat
  async initialize() {
    try {
      if (this.initialized) return true;

      // Cihaz ID'sini al veya oluştur (senkronizasyon için)
      this.deviceId = await this._getDeviceId();
      
      // Son senkronizasyon tarihini al
      const lastSyncDateStr = await AsyncStorage.getItem('lastSyncDate');
      this.lastSyncDate = lastSyncDateStr ? new Date(lastSyncDateStr) : null;
      
      // Bekleyen işlemleri yükle
      const pendingOpsJson = await AsyncStorage.getItem('pendingOperations');
      this.pendingOperations = pendingOpsJson ? JSON.parse(pendingOpsJson) : [];
      
      // İnternet bağlantısını kontrol et
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected;
      
      // İnternet bağlantısı varsa senkronize et
      if (this.isOnline) {
        this.initialSync();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('DataSync servisi başlatma hatası:', error);
      return false;
    }
  }

  // Cihaz ID'sini al veya oluştur
  async _getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = 'mobile_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Cihaz ID alma hatası:', error);
      return 'unknown_device';
    }
  }

  // İlk senkronizasyon (token varsa)
  async initialSync() {
    try {
      // Token varsa sunucu ile senkronize et
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        return false; // Kullanıcı giriş yapmamış
      }
      
      if (!this.isOnline) {
        return false; // İnternet bağlantısı yok
      }
      
      return await this._doSync();
    } catch (error) {
      console.error('İlk senkronizasyon hatası:', error);
      return false;
    }
  }

  // Senkronizasyon işlemini gerçekleştir
  async _doSync() {
    if (this.syncInProgress) return false;
    
    this.syncInProgress = true;
    try {
      // Token kontrolü
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        this.syncInProgress = false;
        return false;
      }
      
      // Sunucu ile senkronize et
      const headers = await getAuthHeaders();
      const response = await fetch('https://acilkanbagisi-api.example.com/api/sync', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          lastSyncDate: this.lastSyncDate,
          pendingOperations: this.pendingOperations
        })
      });
      
      if (response.ok) {
        const syncData = await response.json();
        
        // Sonuçları işle
        if (syncData.results) {
          this._processSyncResults(syncData.results);
        }
        
        // Verileri güncelle
        if (syncData.userData) {
          await AsyncStorage.setItem('userData', JSON.stringify(syncData.userData));
        }
        
        if (syncData.emergencyRequests) {
          await AsyncStorage.setItem('emergencyRequests', JSON.stringify(syncData.emergencyRequests));
        }
        
        if (syncData.hospitals) {
          await AsyncStorage.setItem('hospitals', JSON.stringify(syncData.hospitals));
        }
        
        if (syncData.donations) {
          await AsyncStorage.setItem('donationHistory', JSON.stringify(syncData.donations));
        }
        
        if (syncData.appointments) {
          await AsyncStorage.setItem('appointments', JSON.stringify(syncData.appointments));
        }
        
        // Son senkronizasyon tarihini güncelle
        this.lastSyncDate = syncData.lastSyncDate || new Date();
        await AsyncStorage.setItem('lastSyncDate', this.lastSyncDate.toISOString());
        
        // Başarılı işlemleri bekleyen işlemler listesinden temizle
        this._clearCompletedOperations();
        
        this.syncInProgress = false;
        return true;
      } else {
        // Senkronizasyon hatası
        console.error('Senkronizasyon hatası:', response.status);
        this.syncInProgress = false;
        return false;
      }
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
      this.syncInProgress = false;
      return false;
    }
  }

  // Senkronizasyon sonuçlarını işle
  _processSyncResults(results) {
    // Her bir işlem sonucunu kontrol et
    Object.keys(results).forEach(opId => {
      const result = results[opId];
      
      // Başarılı işlemleri bekleyen listeden kaldır
      if (result.success) {
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== opId);
      }
    });
  }

  // Tamamlanan işlemleri temizle
  async _clearCompletedOperations() {
    try {
      await AsyncStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('Bekleyen işlemler kaydedilemedi:', error);
    }
  }

  // Bekleyen işlem ekle
  async enqueuePendingOperation(operation, data) {
    try {
      const opId = Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const pendingOp = {
        id: opId,
        operation,
        data,
        createdAt: new Date().toISOString()
      };
      
      this.pendingOperations.push(pendingOp);
      await AsyncStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
      
      // İnternet bağlantısı varsa hemen senkronize et
      if (this.isOnline) {
        this.checkConnectionAndSync();
      }
      
      return opId;
    } catch (error) {
      console.error('İşlem sıraya eklenirken hata:', error);
      return null;
    }
  }

  // İnternet bağlantısını kontrol et ve senkronize et
  async checkConnectionAndSync() {
    try {
      // NetInfo ile bağlantı durumunu kontrol et
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected;
      
      if (this.isOnline && this.pendingOperations.length > 0) {
        return await this._doSync();
      }
      
      return this.isOnline;
    } catch (error) {
      console.error('Bağlantı kontrolü hatası:', error);
      return false;
    }
  }

  // İnternet bağlantısı değişimlerini dinle
  subscribeToNetworkChanges(callback) {
    // NetInfo ile bağlantı değişimlerini dinle
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;
      
      // Bağlantı durumu değiştiyse
      if (this.isOnline !== isConnected) {
        this.isOnline = isConnected;
        
        // Callback'i çağır
        if (callback) {
          callback(isConnected);
        }
        
        // Bağlantı geri geldiyse ve bekleyen işlemler varsa senkronize et
        if (isConnected && this.pendingOperations.length > 0) {
          this._doSync();
        }
      }
    });
    
    // Callback'i takip et
    if (callback) {
      this.networkListeners.push(callback);
    }
    
    return unsubscribe;
  }

  // MongoDB Atlas'taki belirli bir koleksiyonu eşitle
  async syncCollection(collectionName) {
    try {
      if (!this.isOnline) {
        return false;
      }
      
      const headers = await getAuthHeaders();
      const response = await fetch(`https://acilkanbagisi-api.example.com/api/sync/collection/${collectionName}`, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Verileri AsyncStorage'a kaydet
        await AsyncStorage.setItem(collectionName, JSON.stringify(data));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`${collectionName} koleksiyonu senkronizasyon hatası:`, error);
      return false;
    }
  }

  // MongoDB modelleri formatını AsyncStorage formatına dönüştür
  _formatMongoDBData(data) {
    if (!data) return null;
    
    // MongoDB ObjectId uyumluluğu için MongoDBConfig yardımcı fonksiyonunu kullan
    return MongoDBConfig.formatObjectId(data);
  }
}

// Singleton instance
export const DataSyncService = new DataSyncService(); 