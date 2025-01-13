import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import * as memoryController from '../controllers/memoryController';

const router = Router();

// Validation
const updateValidation = [
    body('data').exists().withMessage('Les données sont requises')
];

// Routes
router.post('/update', updateValidation, validateRequest, memoryController.updateMemory);
router.get('/context', memoryController.getMemoryContext);
router.get('/state', memoryController.getMemoryState);
router.post('/learn', validateRequest, memoryController.learnPattern);
router.get('/learning/status', memoryController.getLearningStatus);

export default router; 