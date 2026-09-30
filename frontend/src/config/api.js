import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP de mi computadora
export const API_BASE_URL = 'http://192.168.1.8:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar automáticamente el Token JWT en cada petición
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;