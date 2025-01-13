import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../middleware/validateRequest';
import * as memoryController from '../../controllers/memoryController';

const router = Router();

// Validation de la mémoire
const memoryValidation = [
    body('key').isString().notEmpty().withMessage('La clé est requise'),
    body('value').exists().withMessage('La valeur est requise'),
    body('ttl').optional().isInt({ min: 0 }).withMessage('Le TTL doit être un nombre positif')
];

// Routes de la mémoire
router.get('/', memoryController.getAllKeys);
router.get('/:key', memoryController.getValue);
router.post('/', memoryValidation, validateRequest, memoryController.setValue);
router.delete('/:key', memoryController.deleteValue);
router.post('/flush', memoryController.flushAll);
router.get('/stats/usage', memoryController.getMemoryUsage);
router.get('/stats/keys', memoryController.getKeyStats);

export default router; 