import { Router } from 'express';
import { obtenerRutas } from '../controllers/rutasController';
import { login } from '../controllers/authController';
import { obtenerUnidades, registrarTelemetria } from '../controllers/unidadesController';

const router = Router();

// Autenticación
router.post('/auth/login', login);

// Consultas de rutas y unidades
router.get('/rutas', obtenerRutas);
router.get('/unidades', obtenerUnidades);

// IoT Telemetría
router.post('/unidades/telemetria', registrarTelemetria);

export default router;