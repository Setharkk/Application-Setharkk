import { Router } from 'express';
import { automationController } from '../controllers/automationController';
import { auth } from '../middleware/auth';

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Routes pour les automations
router.get('/', automationController.getAutomations);
router.post('/', automationController.createAutomation);
router.put('/:id', automationController.updateAutomation);
router.delete('/:id', automationController.deleteAutomation);
router.patch('/:id/toggle', automationController.toggleAutomation);

export default router; 