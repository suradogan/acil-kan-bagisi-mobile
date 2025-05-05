import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  ScrollView
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Searchbar, Chip, Card, Title, Paragraph, Divider, Button } from 'react-native-paper';
import * as locationService from '../services/locationService';
import api from '../services/api';
import { COLORS } from '../constants/theme';

const HospitalMapScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(10);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı konumunu al
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      
      // Hastaneleri API'dan al
      const response = await api.get('/hospitals/');
      const hospitalsData = response.data;
      
      // Şehirleri al
      const uniqueCities = [...new Set(hospitalsData.map(hospital => hospital.city))].sort();
      setCities(uniqueCities);
      
      // Konum varsa, mesafeleri hesapla
      if (location) {
        const hospitalsWithDistance = hospitalsData.map(hospital => {
          const distance = locationService.calculateDistance(
            location.latitude, 
            location.longitude,
            hospital.latitude,
            hospital.longitude
          );
          return { ...hospital, distance };
        });
        
        setHospitals(hospitalsWithDistance);
        filterHospitals(hospitalsWithDistance, searchQuery, radius, selectedCity);
      } else {
        setHospitals(hospitalsData);
        setFilteredHospitals(hospitalsData);
      }
    } catch (error) {
      console.error('Hastane verileri alınamadı:', error);
      Alert.alert('Hata', 'Hastane verileri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const filterHospitals = (hospitalsData, query, filterRadius, city) => {
    let filtered = [...hospitalsData];
    
    // İsme göre filtrele
    if (query) {
      filtered = filtered.filter(hospital => 
        hospital.name.toLowerCase().includes(query.toLowerCase()) ||
        hospital.city.toLowerCase().includes(query.toLowerCase()) ||
        hospital.district.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Şehre göre filtrele
    if (city) {
      filtered = filtered.filter(hospital => hospital.city === city);
    }
    
    // Mesafeye göre filtrele
    if (userLocation) {
      filtered = filtered.filter(hospital => hospital.distance <= filterRadius);
    }
    
    setFilteredHospitals(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterHospitals(hospitals, query, radius, selectedCity);
  };
  
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    filterHospitals(hospitals, searchQuery, newRadius, selectedCity);
  };
  
  const handleCitySelect = (city) => {
    setSelectedCity(city === selectedCity ? null : city);
    filterHospitals(hospitals, searchQuery, radius, city === selectedCity ? null : city);
  };

  const focusOnHospital = (hospital) => {
    setSelectedHospital(hospital);
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(hospital.latitude),
        longitude: parseFloat(hospital.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }, 1000);
    }
  };

  const openDirections = (hospital) => {
    const url = locationService.getDirectionsUrl({
      latitude: hospital.latitude,
      longitude: hospital.longitude
    });
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Hata', 'Harita uygulaması açılamadı.');
        }
      });
  };

  const renderHospitalItem = ({ item }) => (
    <Card 
      style={styles.hospitalCard}
      onPress={() => focusOnHospital(item)}
    >
      <Card.Content>
        <Title style={styles.hospitalName}>{item.name}</Title>
        <Paragraph style={styles.hospitalAddress}>
          {item.district}, {item.city}
        </Paragraph>
        {item.distance && (
          <View style={styles.distanceBadge}>
            <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
            <Text style={styles.distanceText}>{item.distance} km</Text>
          </View>
        )}
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('HospitalDetail', { hospitalId: item.id })}
        >
          Detaylar
        </Button>
        <Button 
          mode="contained" 
          onPress={() => openDirections(item)}
          style={styles.directionsButton}
        >
          Yol Tarifi
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Hastane ara..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipGroup}>
            <Text style={styles.filterLabel}>Mesafe:</Text>
            <Chip 
              selected={radius === 5}
              onPress={() => handleRadiusChange(5)}
              style={styles.chip}
            >
              5 km
            </Chip>
            <Chip 
              selected={radius === 10}
              onPress={() => handleRadiusChange(10)}
              style={styles.chip}
            >
              10 km
            </Chip>
            <Chip 
              selected={radius === 25}
              onPress={() => handleRadiusChange(25)}
              style={styles.chip}
            >
              25 km
            </Chip>
            <Chip 
              selected={radius === 50}
              onPress={() => handleRadiusChange(50)}
              style={styles.chip}
            >
              50 km
            </Chip>
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.citiesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipGroup}>
            <Text style={styles.filterLabel}>Şehir:</Text>
            {cities.map(city => (
              <Chip
                key={city}
                selected={selectedCity === city}
                onPress={() => handleCitySelect(city)}
                style={styles.chip}
              >
                {city}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Hastaneler yükleniyor...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={userLocation ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : {
              latitude: 41.0082, // İstanbul
              longitude: 28.9784,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
          >
            {userLocation && (
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                title="Konumunuz"
                pinColor="blue"
              >
                <FontAwesome5 name="user-circle" size={24} color="blue" />
              </Marker>
            )}
            
            {filteredHospitals.map(hospital => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: parseFloat(hospital.latitude),
                  longitude: parseFloat(hospital.longitude),
                }}
                title={hospital.name}
                description={hospital.address}
                pinColor="red"
              >
                <FontAwesome5 name="hospital" size={24} color={COLORS.primary} />
                <Callout tooltip onPress={() => navigation.navigate('HospitalDetail', { hospitalId: hospital.id })}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{hospital.name}</Text>
                    <Text style={styles.calloutAddress}>{hospital.district}, {hospital.city}</Text>
                    {hospital.distance && (
                      <Text style={styles.calloutDistance}>{hospital.distance} km</Text>
                    )}
                    <Text style={styles.calloutLink}>Detaylar için dokun</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
      )}
      
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Yakındaki Hastaneler ({filteredHospitals.length})</Text>
        <FlatList
          data={filteredHospitals}
          renderItem={renderHospitalItem}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Yakında hastane bulunamadı.</Text>
              <Text style={styles.emptySubText}>Filtre ayarlarını değiştirmeyi deneyebilirsiniz.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: COLORS.primary,
  },
  searchBar: {
    elevation: 0,
    borderRadius: 8,
  },
  filterContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  citiesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
  },
  chipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  chip: {
    marginRight: 8,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    height: 180,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContent: {
    paddingRight: 20,
  },
  hospitalCard: {
    width: 250,
    marginRight: 10,
    elevation: 3,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 2,
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
  },
  callout: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    width: 200,
    elevation: 3,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  calloutDistance: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 5,
  },
  calloutLink: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primary,
  },
  emptyContainer: {
    width: 250,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default HospitalMapScreen; 