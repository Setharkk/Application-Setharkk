import { Router } from 'express';
import { AutomationController } from '../controllers/automation.controller';

const router = Router();
const automationController = new AutomationController();

// Routes pour les workflows
router.post('/workflows', automationController.createWorkflow);
router.get('/workflows', automationController.getWorkflows);
router.get('/workflows/:workflowId', automationController.getWorkflowDetails);
router.put('/workflows/:workflowId', automationController.updateWorkflow);
router.delete('/workflows/:workflowId', automationController.deleteWorkflow);

// Routes pour l'exécution et l'historique
router.post('/workflows/:workflowId/execute', automationController.executeWorkflow);
router.get('/workflows/:workflowId/history', automationController.getWorkflowHistory);
router.post('/workflows/:workflowId/toggle', automationController.toggleWorkflow);

export default router; 