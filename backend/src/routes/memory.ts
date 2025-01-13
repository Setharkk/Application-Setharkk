import { Router } from 'express';
import { MemoryController } from '../controllers/memory.controller';

const router = Router();
const memoryController = new MemoryController();

// Route pour mettre à jour la mémoire
router.post('/update', memoryController.updateMemory);

// Route pour récupérer le contexte
router.get('/context/:sessionId', memoryController.getContext);

// Route pour récupérer l'état
router.get('/state', memoryController.getState);

// Route pour l'apprentissage de patterns
router.post('/learn', memoryController.learnPattern);

export default router; 