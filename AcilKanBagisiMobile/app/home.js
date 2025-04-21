import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Merhaba,</Text>
        <Text style={styles.nameText}>{user?.full_name || 'Kullanıcı'}</Text>
        <View style={styles.userInfo}>
          <View style={styles.bloodTypeContainer}>
            <Text style={styles.bloodType}>{user?.blood_type || '?'}</Text>
          </View>
          <Text style={styles.donationCount}>
            {user?.donation_count || 0} Bağış
          </Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        
        <View style={styles.menuGrid}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E53935' }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <Text style={styles.menuText}>Profilim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/donations')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#388E3C' }]}>
              <Ionicons name="water" size={24} color="#fff" />
            </View>
            <Text style={styles.menuText}>Bağışlarım</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/add-donation')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#1976D2' }]}>
              <Ionicons name="add-circle" size={24} color="#fff" />
            </View>
            <Text style={styles.menuText}>Bağış Ekle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/emergency-request')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#D32F2F' }]}>
              <Ionicons name="alert-circle" size={24} color="#fff" />
            </View>
            <Text style={styles.menuText}>Acil Talep</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="search" size={22} color="#E53935" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Bağış Merkezleri</Text>
            <Text style={styles.actionDescription}>Size en yakın kan bağış merkezlerini bulun</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="calendar" size={22} color="#E53935" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Bağış Planla</Text>
            <Text style={styles.actionDescription}>Bir sonraki bağışınız için randevu alın</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="notifications" size={22} color="#E53935" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Acil Kan Talepleri</Text>
            <Text style={styles.actionDescription}>Bölgenizdeki acil kan taleplerini görüntüleyin</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#E53935',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodTypeContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  bloodType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
  },
  donationCount: {
    fontSize: 14,
    color: '#fff',
  },
  menuContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
  },
});
