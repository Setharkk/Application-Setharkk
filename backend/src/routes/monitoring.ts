import { Router } from 'express';
import { MonitoringController } from '../controllers';

const router = Router();
const monitoringController = new MonitoringController();

// Route pour obtenir les métriques système
router.get('/metrics', monitoringController.getSystemMetrics);

// Route pour obtenir l'état de santé
router.get('/health', monitoringController.getHealthStatus);

// Route pour obtenir les alertes
router.get('/alerts', monitoringController.getAlerts);

// Route pour configurer les alertes
router.post('/alerts/config', monitoringController.configureAlerts);

export default router; 