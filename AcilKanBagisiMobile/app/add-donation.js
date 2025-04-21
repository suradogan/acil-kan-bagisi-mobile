import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { api } from '../src/services/api';

export default function AddDonationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(true);
  
  const [donationCenters, setDonationCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [donationDate, setDonationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [quantity, setQuantity] = useState('450');
  const [notes, setNotes] = useState('');

  // Bağış merkezlerini yükle
  useEffect(() => {
    const fetchDonationCenters = async () => {
      try {
        setLoadingCenters(true);
        // Gerçek API'den alınacak, şimdilik mock data
        // const response = await api.getDonationCenters();
        // setDonationCenters(response);
        
        // Mock veri
        const mockCenters = [
          { id: '1', name: 'Kızılay Kadıköy Kan Merkezi', address: 'Kadıköy, İstanbul' },
          { id: '2', name: 'Özel Memorial Hastanesi', address: 'Ataşehir, İstanbul' },
          { id: '3', name: 'Kızılay Üsküdar Kan Merkezi', address: 'Üsküdar, İstanbul' },
          { id: '4', name: 'Devlet Hastanesi Kan Merkezi', address: 'Şişli, İstanbul' }
        ];
        
        setTimeout(() => {
          setDonationCenters(mockCenters);
          if (mockCenters.length > 0) {
            setSelectedCenter(mockCenters[0].id);
          }
          setLoadingCenters(false);
        }, 1000);
        
      } catch (error) {
        Alert.alert('Hata', 'Bağış merkezleri yüklenirken bir hata oluştu');
        setLoadingCenters(false);
      }
    };
    
    fetchDonationCenters();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDonationDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!selectedCenter) {
      Alert.alert('Hata', 'Lütfen bir bağış merkezi seçin.');
      return;
    }

    try {
      setLoading(true);
      
      // API ile bağış kaydı oluşturulacak
      // await api.createDonation({
      //   donation_center: selectedCenter,
      //   date: donationDate.toISOString().split('T')[0],
      //   quantity: parseInt(quantity),
      //   note: notes
      // });
      
      // Şimdilik bir gecikme ve başarı mesajı gösteriyoruz
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Başarılı',
          'Bağış kaydınız başarıyla oluşturuldu.',
          [{ text: 'Tamam', onPress: () => router.replace('/donations') }]
        );
      }, 1500);
      
    } catch (error) {
      Alert.alert('Hata', error.message || 'Bağış kaydedilirken bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Bağış Ekle</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={22} color="#E53935" />
          <Text style={styles.infoText}>
            Kan bağışlarınızı kaydetmek sağlık profilinizi oluşturmanıza ve gelecekteki potansiyel bağışçılara ilham vermenize yardımcı olur.
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bağış Merkezi</Text>
          {loadingCenters ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#E53935" />
              <Text style={styles.loadingText}>Merkezler yükleniyor...</Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCenter}
                onValueChange={(itemValue) => setSelectedCenter(itemValue)}
                style={styles.picker}
                enabled={!loadingCenters}
              >
                {donationCenters.map((center) => (
                  <Picker.Item key={center.id} label={center.name} value={center.id} />
                ))}
              </Picker>
            </View>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bağış Tarihi</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{formatDate(donationDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={donationDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bağış Miktarı (ml)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Bağış miktarı (ml)"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Notlar</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ek notlar (isteğe bağlı)"
            multiline
          />
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading || loadingCenters}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Bağışı Kaydet</Text>
            </>
          )}
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
  formContainer: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#E53935',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});
