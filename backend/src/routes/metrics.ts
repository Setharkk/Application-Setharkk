import { Router } from 'express';
import { MetricsController } from '../controllers';

const router = Router();
const metricsController = new MetricsController();

// Route pour enregistrer une métrique
router.post('/', metricsController.recordMetric);

// Route pour obtenir les métriques avec filtres
router.get('/', metricsController.getMetrics);

// Route pour effacer les métriques
router.delete('/', metricsController.clearMetrics);

// Route pour obtenir les statistiques agrégées
router.get('/stats', metricsController.getStats);

export default router; 