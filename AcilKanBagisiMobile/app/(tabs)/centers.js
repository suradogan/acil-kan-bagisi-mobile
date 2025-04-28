import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../../src/services/api';
import { StatusBar } from 'expo-status-bar';

// Harita sadece native platformlarda yüklensin
let MapView = null;
let Marker = null;
let Callout = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

export default function DonationCentersScreen() {
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

  const handleMarkerPress = (center) => {
    setSelectedCenter(center);
  };

  // Web için harita yerine alternatif görünüm
  const renderWebView = () => {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>Kan Bağışı Merkezleri</Text>
        <Text style={styles.webSubtitle}>Web sürümünde harita görüntülenemiyor</Text>
        
        {centers.map((center) => (
          <TouchableOpacity 
            key={center.id} 
            style={styles.centerCard}
            onPress={() => setSelectedCenter(center)}
          >
            <Text style={styles.centerName}>{center.name}</Text>
            <Text style={styles.centerAddress}>{center.address}</Text>
            {center.distance && (
              <Text style={styles.centerDistance}>Uzaklık: {center.distance} km</Text>
            )}
            <Text style={styles.centerPhone}>{center.phone}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Native için harita görünümü
  const renderNativeView = () => {
    return (
      <>
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
              pinColor="#e63946"
              onPress={() => handleMarkerPress(center)}
            >
              <Callout tooltip>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{center.name}</Text>
                  <Text style={styles.calloutAddress}>{center.address}</Text>
                  {center.distance && (
                    <Text style={styles.calloutDistance}>Uzaklık: {center.distance} km</Text>
                  )}
                  <Text style={styles.calloutPhone}>{center.phone}</Text>
                  <Text style={styles.calloutHours}>Çalışma Saatleri: {center.working_hours}</Text>
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
            <Text style={styles.centerPhone}>{selectedCenter.phone}</Text>
            <Text style={styles.centerHours}>Çalışma Saatleri: {selectedCenter.working_hours}</Text>
            
            <TouchableOpacity 
              style={styles.directionButton}
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`;
                Linking.openURL(url);
              }}
            >
              <Text style={styles.directionButtonText}>Yol Tarifi Al</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={styles.loadingText}>Kan bağışı merkezleri yükleniyor...</Text>
        </View>
      ) : (
        <>
          {Platform.OS === 'web' ? renderWebView() : renderNativeView()}
          
          {errorMsg && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#e63946',
  },
  calloutAddress: {
    fontSize: 12,
    color: '#444',
    marginBottom: 5,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  calloutPhone: {
    fontSize: 12,
    color: '#444',
  },
  calloutHours: {
    fontSize: 12,
    color: '#444',
    fontStyle: 'italic',
  },
  centerInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#e63946',
  },
  centerAddress: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  centerDistance: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 5,
  },
  centerPhone: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  centerHours: {
    fontSize: 14,
    color: '#444',
    marginBottom: 15,
  },
  directionButton: {
    backgroundColor: '#e63946',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  directionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffcccc',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e63946',
  },
  errorText: {
    color: '#e63946',
    textAlign: 'center',
  },
  // Web görünümü için stiller
  webContainer: {
    padding: 20,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 10,
  },
  webSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  centerCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  }
}); 