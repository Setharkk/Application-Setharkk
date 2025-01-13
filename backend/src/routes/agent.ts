import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';

const router = Router();
const agentController = new AgentController();

// Route pour traiter l'input de l'agent
router.post('/process', agentController.processInput);

// Route pour récupérer l'état de l'agent
router.get('/state', agentController.getState);

// Route pour mettre à jour le contexte
router.post('/context', agentController.updateContext);

export default router; 