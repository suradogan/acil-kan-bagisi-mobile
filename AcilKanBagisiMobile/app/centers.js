import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import MapWrapper from '../src/components/MapWrapper';

// Yalnızca mobil platformlarda harita bileşenlerini import et
let MapView = null;
let Marker = null;
let Callout = null;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    Callout = RNMaps.Callout;
  } catch (error) {
    console.log('react-native-maps loading error:', error);
  }
}

export default function CentersScreen() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [error, setError] = useState(null);

  // İstanbul'un merkezi (varsayılan konum)
  const defaultRegion = {
    latitude: 41.0082,
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const [region, setRegion] = useState(defaultRegion);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Konum iznini iste
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Konum izni reddedildi');
          // Yine de bağış merkezlerini getir
          const allCenters = await api.getAllDonationCenters();
          setCenters(allCenters);
          return;
        }
        
        // 2. Kullanıcının konumunu al
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(userLocation);
        
        // 3. Harita bölgesini güncelle
        if (userLocation) {
          setRegion({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
        
        // 4. Yakındaki bağış merkezlerini getir
        const nearbyCenters = await api.getNearbyDonationCenters(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          10 // 10 km yarıçapında
        );
        
        setCenters(nearbyCenters || []);
      } catch (err) {
        console.error('Error loading centers:', err);
        setError('Bağış merkezleri yüklenirken bir hata oluştu');
        // Hata durumunda varsayılan merkezleri yüklemeyi dene
        try {
          const allCenters = await api.getAllDonationCenters();
          setCenters(allCenters || []);
        } catch (fetchErr) {
          console.error('Could not fetch centers:', fetchErr);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Merkezleri liste şeklinde gösterme
  const renderCentersList = () => (
    <ScrollView style={styles.listContainer}>
      {centers.map(center => (
        <TouchableOpacity 
          key={center.id} 
          style={styles.centerCard}
          onPress={() => setSelectedCenter(center)}
        >
          <View style={styles.centerCardHeader}>
            <Text style={styles.centerName}>{center.name}</Text>
            {center.distance && (
              <Text style={styles.distance}>{center.distance} km</Text>
            )}
          </View>
          <Text style={styles.address}>{center.address}</Text>
          <Text style={styles.phone}>{center.phone}</Text>
          {center.working_hours && (
            <Text style={styles.workingHours}>Çalışma Saatleri: {center.working_hours}</Text>
          )}
          <TouchableOpacity style={styles.directionsButton}>
            <Ionicons name="navigate" size={16} color="#fff" />
            <Text style={styles.directionsButtonText}>Yol Tarifi</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Harita görünümü (sadece mobile)
  const renderMap = () => {
    if (Platform.OS === 'web' || !MapView) {
      return null;
    }
    
    return (
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
            title="Şu anki konumunuz"
            pinColor="blue"
          />
        )}
        
        {/* Bağış merkezleri */}
        {centers.map(center => (
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
          />
        ))}
      </MapView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Bağış merkezleri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kan Bağış Merkezleri</Text>
        <Text style={styles.headerSubtitle}>
          {centers.length} merkez bulundu
          {location ? ` - ${centers.length > 0 ? 'En yakın merkez: ' + centers[0].distance + ' km' : ''}` : ''}
        </Text>
      </View>
      
      {Platform.OS === 'web' ? (
        // Web için sadece liste görünümü
        renderCentersList()
      ) : (
        // Mobil için harita + seçilen merkez detayları
        <>
          <MapWrapper style={styles.mapContainer}>
            {renderMap()}
          </MapWrapper>
          
          {selectedCenter && (
            <View style={styles.selectedCenterContainer}>
              <View style={styles.selectedCenterHeader}>
                <Text style={styles.selectedCenterName}>{selectedCenter.name}</Text>
                <TouchableOpacity onPress={() => setSelectedCenter(null)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedCenterAddress}>{selectedCenter.address}</Text>
              {selectedCenter.distance && (
                <Text style={styles.selectedCenterDistance}>Uzaklık: {selectedCenter.distance} km</Text>
              )}
              <Text style={styles.selectedCenterPhone}>{selectedCenter.phone}</Text>
              {selectedCenter.working_hours && (
                <Text style={styles.selectedCenterHours}>
                  Çalışma Saatleri: {selectedCenter.working_hours}
                </Text>
              )}
              <TouchableOpacity style={styles.directionsButton}>
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={styles.directionsButtonText}>Yol Tarifi Al</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#E53935',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  centerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  centerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  distance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  workingHours: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  directionsButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  directionsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  selectedCenterContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectedCenterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCenterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  selectedCenterAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedCenterDistance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 5,
  },
  selectedCenterPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedCenterHours: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
}); 