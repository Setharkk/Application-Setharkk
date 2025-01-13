import { Router } from 'express';
import { MLController } from '../controllers/ml.controller';

const router = Router();
const mlController = new MLController();

// Routes pour l'analyse et le traitement ML
router.post('/analyze', mlController.analyzeText);
router.post('/summary', mlController.generateSummary);
router.post('/classify', mlController.classifyContent);
router.post('/entities', mlController.extractEntities);
router.post('/generate', mlController.generateResponse);

export default router; 