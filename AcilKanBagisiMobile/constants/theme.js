export const COLORS = {
  // Kan bağışı ile ilgili ana renkler
  primary: '#E53935', // Kırmızı
  primaryDark: '#B71C1C',
  primaryLight: '#EF5350',
  secondary: '#42A5F5', // Mavi
  secondaryDark: '#1565C0',
  secondaryLight: '#90CAF9',
  
  // Diğer UI renkleri
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#212121',
  textLight: '#757575',
  border: '#EEEEEE',
  notification: '#FF5722',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Kan grupları için renkler
  blood: {
    'A+': '#E53935',
    'A-': '#EF5350',
    'B+': '#1E88E5',
    'B-': '#42A5F5',
    'AB+': '#7E57C2',
    'AB-': '#9575CD',
    'O+': '#43A047',
    'O-': '#66BB6A',
  },
};

export const FONTS = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: 'bold' },
  h4: { fontSize: 16, fontWeight: 'bold' },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: 'bold' },
};

export const SIZES = {
  // Global spacing
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
  
  // Font sizes
  title: 24,
  subtitle: 20,
  paragraph: 16,
  caption: 12,
  
  // Radius
  radius: 8,
  radiusSmall: 4,
  radiusLarge: 12,
  
  // Screen dimensions
  width: '100%',
  height: '100%',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 40,
};

export default { COLORS, FONTS, SIZES, SHADOWS, SPACING }; 