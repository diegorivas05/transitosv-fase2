import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email, password) => {
    try {
      // Enviamos 'correo' y 'contraseña' tal como lo lee authControllers.ts
      const response = await api.post('/auth/login', { 
        correo: email, 
        contraseña: password 
      });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Error de conexión con el servidor' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  getToken: async () => {
    return await AsyncStorage.getItem('userToken');
  }
};