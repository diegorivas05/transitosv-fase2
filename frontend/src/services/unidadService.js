import api from '../config/api';

export const unidadService = {
  // Obtener todas las unidades registradas y sus ubicaciones
  getUnidades: async () => {
    try {
      const response = await api.get('/unidades');
      return response.data;
    } catch (error) {
      console.log('Error al obtener unidades:', error);
      throw error.response ? error.response.data : { message: 'Error al conectar con el servidor' };
    }
  },

  // Obtener rutas disponibles
  getRutas: async () => {
    try {
      const response = await api.get('/rutas');
      return response.data;
    } catch (error) {
      console.log('Error al obtener rutas:', error);
      throw error.response ? error.response.data : { message: 'Error al conectar con el servidor' };
    }
  }
};