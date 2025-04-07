import auth from '@react-native-firebase/auth';

// API temel URL'si
const BASE_URL = 'http://your-api-url.com'; // API URL'nizi buraya ekleyin

// Mock API responses
const mockUsers = [
  {
    email: 'test@test.com',
    password: '123456',
    name: 'Test User'
  }
];

const api = {
  auth: {
    login: async (email, password) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        return {
          success: true,
          data: {
            user: {
              id: '1',
              email: user.email,
              name: user.name
            },
            token: 'mock-jwt-token'
          }
        };
      }

      return {
        success: false,
        error: 'Invalid email or password'
      };
    },

    register: async (userData) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      if (mockUsers.some(u => u.email === userData.email)) {
        return {
          success: false,
          error: 'Email already registered'
        };
      }

      // Add new user to mock database
      mockUsers.push(userData);

      return {
        success: true,
        data: {
          user: {
            id: String(mockUsers.length),
            email: userData.email,
            name: userData.name
          },
          token: 'mock-jwt-token'
        }
      };
    },

    // Çıkış işlemi
    logout: async () => {
      try {
        await auth().signOut();
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Çıkış yapılamadı' };
      }
    }
  }
};

export default api; 