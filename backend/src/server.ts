import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import asistenteRoutes from './routes/asistenteRoutes';
import { checkDatabaseConnection } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API TransitoSV activa y funcionando 🚀',
    version: '1.0',
    endpoints: [
      '/api/rutas',
      '/api/unidades',
      '/api/auth/login',
      '/api/asistente/chat'
    ]
  });
});

app.use('/api', router);
app.use('/api/asistente', asistenteRoutes);

// Escuchar en '0.0.0.0' para permitir tráfico de la red local
app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`[OK] Servidor TransitoSV ejecutándose en http://0.0.0.0:${PORT}`);
  console.log(`[OK] Accesible en red local vía http://192.168.0.10:${PORT}`);
  await checkDatabaseConnection();
});