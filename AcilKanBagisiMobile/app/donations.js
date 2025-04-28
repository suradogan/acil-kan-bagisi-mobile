// app/donations.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useRouter, Link } from 'expo-router';

export default function DonationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donations, setDonations] = useState([]);

  // Örnek veri - gerçek uygulamada API'den çekilecek
  const mockDonations = [
    {
      id: '1',
      date: '2023-05-15',
      donation_center: {
        name: 'Kızılay Kadıköy Kan Merkezi',
        address: 'Kadıköy, İstanbul',
      },
      quantity: 450,
      status: 'completed'
    },
    {
      id: '2',
      date: '2023-03-10',
      donation_center: {
        name: 'Özel Memorial Hastanesi',
        address: 'Ataşehir, İstanbul',
      },
      quantity: 450,
      status: 'completed'
    },
    {
      id: '3',
      date: '2023-01-05',
      donation_center: {
        name: 'Kızılay Üsküdar Kan Merkezi',
        address: 'Üsküdar, İstanbul',
      },
      quantity: 450,
      status: 'completed'
    }
  ];

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      // API, kullanıcının bağışlarını getirecek şekilde genişletilecek
      // const response = await api.getUserDonations();
      // setDonations(response.data);
      
      // Şimdilik mock veriyi kullanıyoruz
      setTimeout(() => {
        setDonations(mockDonations);
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Hata', 'Bağış geçmişi yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDonations();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA000';
      case 'scheduled':
        return '#1976D2';
      case 'completed':
        return '#388E3C';
      case 'cancelled':
        return '#D32F2F';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'scheduled':
        return 'Planlandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const renderDonationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.donationCard}
      onPress={() => Alert.alert('Bağış Detayı', `${item.donation_center.name} bağış detayları`)}
    >
      <View style={styles.donationHeader}>
        <Text style={styles.donationDate}>{item.date}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.donationBody}>
        <View style={styles.donationCenter}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.donationCenterName}>{item.donation_center.name}</Text>
        </View>
        <Text style={styles.donationAddress}>{item.donation_center.address}</Text>
      </View>
      
      <View style={styles.donationFooter}>
        <Text style={styles.quantityText}>{item.quantity} ml</Text>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bağış Geçmişim</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.donation_count || 0}</Text>
            <Text style={styles.statLabel}>Toplam Bağış</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donations.length}</Text>
            <Text style={styles.statLabel}>Listelenmiş</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : donations.length > 0 ? (
        <FlatList
          data={donations}
          renderItem={renderDonationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#E53935']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="water-outline" size={60} color="#E53935" />
          <Text style={styles.emptyText}>Henüz bağış kaydınız bulunmuyor</Text>
          <Text style={styles.emptySubText}>Yeni bir kan bağışı eklemek için aşağıdaki düğmeye tıklayın</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/add-donation')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Yeni Bağış Ekle</Text>
      </TouchableOpacity>
    </View>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  donationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  donationDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  donationBody: {
    marginBottom: 12,
  },
  donationCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  donationCenterName: {
    fontSize: 15,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  donationAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 20,
  },
  donationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E53935',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});