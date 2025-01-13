import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';

const router = Router();
const workflowController = new WorkflowController();

// Routes pour la gestion des workflows
router.post('/', workflowController.createWorkflow);
router.get('/', workflowController.getWorkflows);
router.patch('/:workflowId/status', workflowController.updateWorkflowStatus);
router.delete('/:workflowId', workflowController.deleteWorkflow);

export default router; 