import { Router } from 'express';
import { chatAsistente } from '../controllers/asistenteController';

const router = Router();

router.post('/chat', chatAsistente);

export default router;