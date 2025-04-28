// app/profile.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  TextInput, Image, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/services/api';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState({
    full_name: '',
    phone_number: '',
    city: '',
    district: '',
    address: '',
    blood_type: ''
  });

  useEffect(() => {
    if (user) {
      setUserData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        city: user.city || '',
        district: user.district || '',
        address: user.address || '',
        blood_type: user.blood_type || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // API, profil güncelleme fonksiyonu içerecek şekilde genişletilecek
      // await api.updateProfile(userData);
      
      // Şimdilik sadece state'i güncelliyoruz
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      setEditing(false);
    } catch (error) {
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitials}>
              {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{user.full_name}</Text>
        <View style={styles.bloodTypeContainer}>
          <Text style={styles.bloodType}>{user.blood_type}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.donation_count || 0}</Text>
          <Text style={styles.statLabel}>Bağış</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.last_donation_date || '-'}</Text>
          <Text style={styles.statLabel}>Son Bağış</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>
          {editing ? 'Profili Düzenle' : 'Profil Bilgileri'}
          {!editing && (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setEditing(true)}
            >
              <Ionicons name="pencil" size={18} color="#E53935" />
            </TouchableOpacity>
          )}
        </Text>

        {editing ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                value={userData.full_name}
                onChangeText={(text) => setUserData({...userData, full_name: text})}
                placeholder="Ad Soyad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                value={userData.phone_number}
                onChangeText={(text) => setUserData({...userData, phone_number: text})}
                placeholder="Telefon Numarası"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şehir</Text>
              <TextInput
                style={styles.input}
                value={userData.city}
                onChangeText={(text) => setUserData({...userData, city: text})}
                placeholder="Şehir"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İlçe</Text>
              <TextInput
                style={styles.input}
                value={userData.district}
                onChangeText={(text) => setUserData({...userData, district: text})}
                placeholder="İlçe"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adres</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={userData.address}
                onChangeText={(text) => setUserData({...userData, address: text})}
                placeholder="Adres"
                multiline
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveProfile}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoDetails}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{user.phone_number || 'Belirtilmemiş'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {user.city && user.district 
                  ? `${user.city}, ${user.district}` 
                  : 'Belirtilmemiş'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="home-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{user.address || 'Belirtilmemiş'}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#E53935',
    paddingTop: 20,
    paddingBottom: 50,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E53935',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  bloodTypeContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  bloodType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
    height: '80%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  editButton: {
    marginLeft: 10,
  },
  infoDetails: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
    flex: 1,
  },
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#E53935',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    margin: 15,
    marginTop: 20,
  },
  logoutText: {
    color: '#e63946',
    fontWeight: 'bold',
  },
  donationsContainer: {
    paddingHorizontal: 15,
  },
  donationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  donationDate: {
    fontSize: 14,
    color: '#666',
  },
  donationStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  donationCenter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  donationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  donationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donationAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e63946',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  newDonationButton: {
    backgroundColor: '#e63946',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  newDonationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});