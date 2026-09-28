import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import { checkDatabaseConnection } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API TransitoSV activa y funcionando 🚀',
    version: '1.0',
    endpoints: ['/api/rutas', '/api/unidades', '/api/auth/login']
  });
});

app.use('/api', router);

app.listen(PORT, async () => {
  console.log(`[OK] Servidor TransitoSV ejecutandose en http://localhost:${PORT}`);
  await checkDatabaseConnection();
});