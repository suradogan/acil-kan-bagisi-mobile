import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const [centers, setCenters] = useState([]);
  
  // Haritayı göster fonksiyonu
  const handleShowMap = async () => {
    try {
      // Konum izni iste
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Haritayı kullanmak için konum izni gereklidir');
        return;
      }
      
      // Kullanıcı konumunu al
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // API'den yakındaki kan bağışı merkezlerini getir (mock örnek)
      const mockCenters = [
        {
          id: 1,
          name: 'Kızılay Kan Merkezi',
          latitude: location.coords.latitude + 0.01,
          longitude: location.coords.longitude + 0.01
        },
        {
          id: 2,
          name: 'Hastane Kan Merkezi',
          latitude: location.coords.latitude - 0.01,
          longitude: location.coords.longitude - 0.01
        }
      ];
      setCenters(mockCenters);
      
      // Haritayı göster
      setShowMap(true);
    } catch (error) {
      console.error('Konum alınamadı:', error);
      alert('Konum bilgisi alınamadı. Lütfen konum servislerini etkinleştirin.');
    }
  };
  
  // Harita görünümü
  if (showMap && location) {
    return (
      <View style={styles.container}>
        <View style={styles.mapHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowMap(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.mapHeaderTitle}>Kan Bağış Merkezleri</Text>
        </View>
        
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Kullanıcı konumu */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }}
            title="Konumunuz"
            pinColor="blue"
          />
          
          {/* Kan bağış merkezleri */}
          {centers.map(center => (
            <Marker
              key={center.id}
              coordinate={{
                latitude: center.latitude,
                longitude: center.longitude
              }}
              title={center.name}
              pinColor="#E53935"
            />
          ))}
        </MapView>
      </View>
    );
  }
  
  // Normal ana sayfa görünümü
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Merhaba, {user?.full_name || 'Misafir'}</Text>
        <Text style={styles.titleText}>Acil Kan Bağışı</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.cardRow}>
          <TouchableOpacity 
            style={[styles.card, styles.cardDonate]} 
            onPress={() => router.push('/add-donation')}
          >
            <Ionicons name="water" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Bağış Ekle</Text>
            <Text style={styles.cardDesc}>Yeni kan bağışı kaydı oluşturun</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, styles.cardEmergency]}
            onPress={() => router.push('/emergency-request')}
          >
            <Ionicons name="alert-circle" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Acil Talep</Text>
            <Text style={styles.cardDesc}>Acil kan ihtiyacı oluşturun</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardRow}>
          <TouchableOpacity 
            style={[styles.card, styles.cardCenters]}
            onPress={handleShowMap}
          >
            <Ionicons name="location" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Bağış Noktaları</Text>
            <Text style={styles.cardDesc}>En yakın bağış merkezlerini bulun</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, styles.cardProfile]}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Profilim</Text>
            <Text style={styles.cardDesc}>Bağış geçmişinizi görüntüleyin</Text>
          </TouchableOpacity>
        </View>
        
        {/* Özel Harita Butonu */}
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={handleShowMap}
        >
          <Ionicons name="map" size={24} color="#fff" />
          <Text style={styles.mapButtonText}>KAN BAĞIŞ MERKEZLERİNİ GÖSTER</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
          <Ionicons name="home" size={24} color="#E53935" />
          <Text style={styles.navText}>Ana Sayfa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/centers')}>
          <Ionicons name="location" size={24} color="#666" />
          <Text style={styles.navText}>Merkezler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/donations')}>
          <Ionicons name="water" size={24} color="#666" />
          <Text style={styles.navText}>Bağışlarım</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/profile')}>
          <Ionicons name="person" size={24} color="#666" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#E53935',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  titleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 170,
  },
  cardDonate: {
    backgroundColor: '#E53935',
  },
  cardEmergency: {
    backgroundColor: '#ff9800',
  },
  cardCenters: {
    backgroundColor: '#2196f3',
  },
  cardProfile: {
    backgroundColor: '#4caf50',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  // Özel harita butonu
  mapButton: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Harita görünümü için stiller
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E53935',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  backButton: {
    marginRight: 15,
  },
  mapHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

