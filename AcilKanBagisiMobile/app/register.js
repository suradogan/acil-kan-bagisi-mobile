import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { api } from '../src/services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();

  const bloodTypes = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !bloodType) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    
    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }
    
    // Password length validation
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create user data object
      const userData = {
        full_name: name,
        email,
        password,
        blood_type: bloodType
      };

      await register(userData);
      router.replace("/home");
    } catch (err) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace("/login");
  };

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.testConnection();
      setError(`Bağlantı başarılı: ${result.message}`);
    } catch (error) {
      setError("Bağlantı hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ad ve soyadınızı girin"
          value={name}
          onChangeText={setName}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="E-posta adresinizi girin"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi girin"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kan Grubu</Text>
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
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, {backgroundColor: '#4CAF50', marginTop: 10}]} 
        onPress={testApiConnection}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>API Bağlantısını Test Et</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Zaten bir hesabınız var mı?</Text>
        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.loginLink}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#e63946',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    width: '100%',
  },
  button: {
    backgroundColor: '#e63946',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e63946',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: '#333',
  },
  loginLink: {
    color: '#e63946',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
