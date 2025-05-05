import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Button, Card, Chip, Divider } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as locationService from '../services/locationService';
import api from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

const HospitalDetailScreen = ({ route, navigation }) => {
  const { hospitalId } = route.params;
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bloodNeeds, setBloodNeeds] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [userDistance, setUserDistance] = useState(null);
  
  useEffect(() => {
    loadHospitalDetails();
  }, [hospitalId]);
  
  const loadHospitalDetails = async () => {
    try {
      setLoading(true);
      
      // Hastane bilgilerini al
      const response = await api.get(`/hospitals/${hospitalId}/`);
      setHospital(response.data);
      
      // Kullanıcı konumunu al ve mesafeyi hesapla
      const location = await locationService.getCurrentLocation();
      if (location && response.data) {
        const distance = locationService.calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(response.data.latitude),
          parseFloat(response.data.longitude)
        );
        setUserDistance(distance);
      }
      
      // Acil kan ihtiyaçlarını al
      const emergencyResponse = await api.get(`/hospitals/${hospitalId}/emergency_requests/`);
      setBloodNeeds(emergencyResponse.data);
      
      // Son bağışları al
      const donationsResponse = await api.get(`/hospitals/${hospitalId}/donations/`);
      setRecentDonations(donationsResponse.data.slice(0, 5)); // Son 5 bağış
      
    } catch (error) {
      console.error('Hastane detayları alınamadı:', error);
      Alert.alert('Hata', 'Hastane bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCall = () => {
    if (!hospital?.phone) return;
    
    Linking.canOpenURL(`tel:${hospital.phone}`)
      .then(supported => {
        if (supported) {
          Linking.openURL(`tel:${hospital.phone}`);
        } else {
          Alert.alert('Hata', 'Telefon araması yapılamadı.');
        }
      });
  };
  
  const handleEmail = () => {
    if (!hospital?.email) return;
    
    Linking.canOpenURL(`mailto:${hospital.email}`)
      .then(supported => {
        if (supported) {
          Linking.openURL(`mailto:${hospital.email}`);
        } else {
          Alert.alert('Hata', 'E-posta gönderilemedi.');
        }
      });
  };
  
  const handleDirections = () => {
    if (!hospital) return;
    
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
  
  const handleDonate = () => {
    navigation.navigate('DonationCreate', { hospitalId: hospitalId });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Hastane bilgileri yükleniyor...</Text>
      </View>
    );
  }
  
  if (!hospital) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-triangle" size={50} color={COLORS.warning} />
        <Text style={styles.errorText}>Hastane bilgileri bulunamadı.</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
        >
          Geri Dön
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <Text style={styles.hospitalAddress}>
            {hospital.district}, {hospital.city}
          </Text>
          {userDistance && (
            <View style={styles.distanceBadge}>
              <MaterialIcons name="location-on" size={16} color="#fff" />
              <Text style={styles.distanceText}>Uzaklık: {userDistance} km</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Hızlı İşlemler */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary }]}>
            <FontAwesome5 name="phone-alt" size={20} color="#fff" />
          </View>
          <Text style={styles.actionText}>Ara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
            <FontAwesome5 name="directions" size={20} color="#fff" />
          </View>
          <Text style={styles.actionText}>Yol Tarifi</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.info }]}>
            <FontAwesome5 name="envelope" size={20} color="#fff" />
          </View>
          <Text style={styles.actionText}>E-posta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDonate}>
          <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
            <FontAwesome5 name="tint" size={20} color="#fff" />
          </View>
          <Text style={styles.actionText}>Bağış Yap</Text>
        </TouchableOpacity>
      </View>
      
      {/* İletişim Bilgileri */}
      <Card style={styles.card}>
        <Card.Title title="İletişim Bilgileri" />
        <Card.Content>
          <View style={styles.contactItem}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>{hospital.address}</Text>
          </View>
          
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>{hospital.phone}</Text>
          </View>
          
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>{hospital.email}</Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Harita */}
      <Card style={styles.card}>
        <Card.Title title="Konum" />
        <Card.Content>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(hospital.latitude),
                longitude: parseFloat(hospital.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              zoomEnabled
              scrollEnabled
              rotateEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(hospital.latitude),
                  longitude: parseFloat(hospital.longitude),
                }}
                title={hospital.name}
              >
                <FontAwesome5 name="hospital" size={24} color={COLORS.primary} />
              </Marker>
            </MapView>
            
            <Button 
              mode="contained" 
              icon="directions" 
              onPress={handleDirections}
              style={styles.directionsButton}
            >
              Yol Tarifi Al
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Acil Kan İhtiyaçları */}
      <Card style={styles.card}>
        <Card.Title title="Acil Kan İhtiyacı" />
        <Card.Content>
          {bloodNeeds.length > 0 ? (
            <View style={styles.bloodNeedsContainer}>
              {bloodNeeds.map((need, index) => (
                <View key={index} style={styles.bloodNeedItem}>
                  <View style={styles.bloodTypeContainer}>
                    <Text style={styles.bloodType}>{need.blood_type}</Text>
                  </View>
                  <View style={styles.bloodNeedInfo}>
                    <Text style={styles.bloodNeedTitle}>{need.blood_type} Kan Grubu</Text>
                    <Text style={styles.bloodNeedDescription}>
                      Aciliyet: {need.urgency_level === 'high' ? 'Yüksek' : need.urgency_level === 'medium' ? 'Orta' : 'Normal'}
                    </Text>
                  </View>
                  <Chip 
                    mode="flat"
                    style={{
                      backgroundColor: 
                        need.urgency_level === 'high' ? COLORS.error : 
                        need.urgency_level === 'medium' ? COLORS.warning : 
                        COLORS.success
                    }}
                  >
                    {need.urgency_level === 'high' ? 'Acil' : need.urgency_level === 'medium' ? 'Orta' : 'Normal'}
                  </Chip>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Şu anda acil kan ihtiyacı bulunmamaktadır.</Text>
            </View>
          )}
          
          <Button 
            mode="outlined" 
            icon="tint"
            onPress={handleDonate}
            style={styles.donateButton}
          >
            Kan Bağışı Yap
          </Button>
        </Card.Content>
      </Card>
      
      {/* Son Bağışlar */}
      <Card style={styles.card}>
        <Card.Title title="Son Bağışlar" />
        <Card.Content>
          {recentDonations.length > 0 ? (
            <View style={styles.recentDonationsContainer}>
              {recentDonations.map((donation, index) => (
                <View key={index} style={styles.donationItem}>
                  <View style={styles.bloodTypeContainer}>
                    <Text style={styles.bloodType}>{donation.blood_type}</Text>
                  </View>
                  <View style={styles.donationInfo}>
                    <Text style={styles.donationDonor}>
                      {donation.donor.first_name} {donation.donor.last_name.charAt(0)}.
                    </Text>
                    <Text style={styles.donationDate}>
                      {new Date(donation.donation_date).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz kan bağışı yapılmamış.</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 25,
  },
  headerContent: {
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  hospitalAddress: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
  },
  distanceText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  card: {
    marginBottom: 15,
    marginHorizontal: 15,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    height: 200,
    width: '100%',
    borderRadius: 8,
  },
  directionsButton: {
    marginTop: 10,
    backgroundColor: COLORS.secondary,
  },
  bloodNeedsContainer: {
    marginBottom: 10,
  },
  bloodNeedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    ...SHADOWS.small,
  },
  bloodTypeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bloodType: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bloodNeedInfo: {
    flex: 1,
  },
  bloodNeedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bloodNeedDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  donateButton: {
    marginTop: 10,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  recentDonationsContainer: {
    marginBottom: 10,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    ...SHADOWS.small,
  },
  donationInfo: {
    flex: 1,
  },
  donationDonor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  donationDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
  },
});

export default HospitalDetailScreen; 