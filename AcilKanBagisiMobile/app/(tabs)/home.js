import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const navigateTo = (route) => {
    router.push(route);
  };
  
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
            onPress={() => navigateTo('/add-donation')}
          >
            <Ionicons name="water" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Bağış Ekle</Text>
            <Text style={styles.cardDesc}>Yeni kan bağışı kaydı oluşturun</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, styles.cardEmergency]}
            onPress={() => navigateTo('/emergency-request')}
          >
            <Ionicons name="alert-circle" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Acil Talep</Text>
            <Text style={styles.cardDesc}>Acil kan ihtiyacı oluşturun</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardRow}>
          <TouchableOpacity 
            style={[styles.card, styles.cardCenters]}
            onPress={() => router.push('/(tabs)/centers')}
          >
            <Ionicons name="location" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Bağış Noktaları</Text>
            <Text style={styles.cardDesc}>En yakın bağış merkezlerini bulun</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, styles.cardProfile]}
            onPress={() => navigateTo('/profile')}
          >
            <Ionicons name="person" size={40} color="#fff" />
            <Text style={styles.cardTitle}>Profilim</Text>
            <Text style={styles.cardDesc}>Bağış geçmişinizi görüntüleyin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  }
}); 