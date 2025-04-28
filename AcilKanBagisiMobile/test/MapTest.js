import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapTest() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Konum izni reddedildi');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg('Konum alınamadı: ' + error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  let text = 'Konum bekleniyor...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Enlem: ${location.coords.latitude}, Boylam: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Harita Test Ekranı</Text>
      <Text style={styles.paragraph}>{text}</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#E53935" />
      ) : location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }}
            title="Konumunuz"
          />
        </MapView>
      ) : (
        <Text style={styles.error}>Haritayı göstermek için konum gerekli</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  map: {
    width: Dimensions.get('window').width - 40,
    height: 400,
    borderRadius: 10,
    marginTop: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  }
}); 