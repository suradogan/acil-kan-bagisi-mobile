import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // İstanbul koordinatları (başlangıç değeri)
  const [region, setRegion] = useState({
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Konum izni iste
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Konum izni verilmedi');
          // İzin verilmese de merkezleri göster
          const allCenters = await api.getAllDonationCenters();
          setCenters(allCenters);
          setLoading(false);
          return;
        }

        // Kullanıcı konumunu al
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Harita konumunu güncelle
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        
        // Yakındaki merkezleri getir
        const nearbyCenters = await api.getNearbyDonationCenters(
          location.coords.latitude,
          location.coords.longitude,
          10 // 10km yarıçapta ara
        );
        
        setCenters(nearbyCenters);
      } catch (error) {
        console.error("Konum veya merkez bilgileri alınamadı:", error);
        setErrorMsg("Konum veya bağış merkezi bilgileri alınamadı.");
        
        // Hata durumunda tüm merkezleri getirmeyi dene
        try {
          const allCenters = await api.getAllDonationCenters();
          setCenters(allCenters);
        } catch (e) {
          console.error("Merkezler getirilemedi:", e);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kan Bağış Merkezleri</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Merkezler yükleniyor...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {/* Kullanıcı konumu */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Konumunuz"
                pinColor="blue"
              />
            )}
            
            {/* Kan bağışı merkezleri */}
            {centers.map((center) => (
              <Marker
                key={center.id}
                coordinate={{
                  latitude: center.latitude,
                  longitude: center.longitude,
                }}
                title={center.name}
                description={center.address}
                pinColor="#E53935"
                onPress={() => setSelectedCenter(center)}
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{center.name}</Text>
                    <Text style={styles.calloutAddress}>{center.address}</Text>
                    {center.distance && (
                      <Text style={styles.calloutDistance}>Uzaklık: {center.distance} km</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
          
          {selectedCenter && (
            <View style={styles.centerInfoContainer}>
              <Text style={styles.centerName}>{selectedCenter.name}</Text>
              <Text style={styles.centerAddress}>{selectedCenter.address}</Text>
              {selectedCenter.distance && (
                <Text style={styles.centerDistance}>Uzaklık: {selectedCenter.distance} km</Text>
              )}
              <TouchableOpacity style={styles.directionButton}>
                <Text style={styles.directionButtonText}>Yol Tarifi Al</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  calloutAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  calloutDistance: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
  },
  centerInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  centerAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  centerDistance: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  directionButton: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  directionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MapScreen; 