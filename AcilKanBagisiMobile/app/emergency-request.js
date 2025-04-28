// app/emergency-request.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { api } from '../src/services/api';

export default function EmergencyRequestScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [patientName, setPatientName] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [unitsNeeded, setUnitsNeeded] = useState('1');
  const [urgencyLevel, setUrgencyLevel] = useState('2');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 86400000 * 3)); // 3 gün sonra
  const [showDatePicker, setShowDatePicker] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const urgencyLevels = [
    { id: '1', label: 'Düşük' },
    { id: '2', label: 'Orta' },
    { id: '3', label: 'Yüksek' }
  ];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!patientName || !hospital || !city || !phoneNumber) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      
      // API ile acil talep gönder
      await api.createEmergencyRequest({
        patient_name: patientName,
        blood_type: bloodType,
        hospital,
        city,
        district,
        address,
        units_needed: parseInt(unitsNeeded),
        urgency_level: parseInt(urgencyLevel),
        phone_number: phoneNumber,
        additional_info: additionalInfo,
        expires_at: expiryDate.toISOString()
      });
      
      setLoading(false);
      Alert.alert(
        'Başarılı',
        'Acil kan talebi başarıyla oluşturuldu. Uygun donörler bilgilendirilecek.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
      
    } catch (error) {
      Alert.alert('Hata', error.message || 'Talep oluşturulurken bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acil Kan Talebi</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={22} color="#E53935" />
          <Text style={styles.infoText}>
            Bu form acil kan ihtiyacı olan hasta için talep oluşturmak içindir. 
            Bilgileri doğru ve eksiksiz doldurunuz.
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hasta Adı*</Text>
          <TextInput
            style={styles.input}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Hasta adını girin"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Kan Grubu*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bloodType}
              onValueChange={(itemValue) => setBloodType(itemValue)}
              style={styles.picker}
            >
              {bloodTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hastane/Tıp Merkezi*</Text>
          <TextInput
            style={styles.input}
            value={hospital}
            onChangeText={setHospital}
            placeholder="Hastane adını girin"
          />
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Şehir*</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Şehir"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>İlçe</Text>
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="İlçe"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Adres Detayı</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Detaylı adres bilgisi"
            multiline
          />
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>İhtiyaç Duyulan Ünite</Text>
            <TextInput
              style={styles.input}
              value={unitsNeeded}
              onChangeText={setUnitsNeeded}
              placeholder="Ünite sayısı"
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Aciliyet Seviyesi</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={urgencyLevel}
                onValueChange={(itemValue) => setUrgencyLevel(itemValue)}
                style={styles.picker}
              >
                {urgencyLevels.map((level) => (
                  <Picker.Item key={level.id} label={level.label} value={level.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>İletişim Telefonu*</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Telefon numarası"
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Son Geçerlilik Tarihi</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerText}>{formatDate(expiryDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Ek Bilgiler</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            placeholder="Ek bilgi veya notlar"
            multiline
          />
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="water" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Acil Talebi Oluştur</Text>
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
  formRow: {
    flexDirection: 'row',
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