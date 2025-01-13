import { Router } from 'express';
import { SystemController } from '../controllers/system.controller';

const router = Router();
const systemController = new SystemController();

// Routes pour le système
router.get('/status', systemController.getSystemStatus);
router.get('/resources', systemController.getSystemResources);
router.get('/logs', systemController.getSystemLogs);
router.get('/config', systemController.getSystemConfig);
router.put('/config', systemController.updateSystemConfig);
router.get('/diagnostics', systemController.getSystemDiagnostics);
router.post('/maintenance', systemController.performSystemMaintenance);

export default router; 