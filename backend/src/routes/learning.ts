import { Router } from 'express';
import { LearningController } from '../controllers/learning.controller';

const router = Router();
const learningController = new LearningController();

// Routes pour les modèles
router.post('/models', learningController.createModel);
router.get('/models', learningController.getModels);
router.get('/models/:modelId', learningController.getModelDetails);
router.put('/models/:modelId', learningController.updateModel);
router.delete('/models/:modelId', learningController.deleteModel);

// Routes pour l'entraînement et l'évaluation
router.post('/models/:modelId/train', learningController.trainModel);
router.post('/models/:modelId/evaluate', learningController.evaluateModel);
router.post('/models/:modelId/predict', learningController.predictModel);
router.get('/models/:modelId/metrics', learningController.getModelMetrics);

export default router; 