import { Router } from 'express';
import { predict } from '../controllers/aiController';

const router = Router();

router.get('/predict', predict);

export default router;