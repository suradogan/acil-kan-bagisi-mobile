import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Web için harita bileşenini kullanma
const MapWrapper = ({ children, style, placeholderText = "Harita yalnızca mobil platformlarda görüntülenebilir" }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[style, styles.webPlaceholder]}>
        <Text style={styles.placeholderText}>{placeholderText}</Text>
      </View>
    );
  }
  
  return children;
};

const styles = StyleSheet.create({
  webPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});

export default MapWrapper; 