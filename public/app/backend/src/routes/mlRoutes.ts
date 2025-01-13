import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import * as mlController from '../controllers/mlController';

const router = Router();

// Validation des requêtes
const textValidation = [
    body('text').isString().notEmpty().withMessage('Le texte est requis')
];

const classificationValidation = [
    body('text').isString().notEmpty().withMessage('Le texte est requis'),
    body('categories').isArray().notEmpty().withMessage('Les catégories sont requises')
];

const responseValidation = [
    body('prompt').isString().notEmpty().withMessage('Le prompt est requis'),
    body('context').optional().isObject(),
    body('options').optional().isObject()
];

// Routes d'analyse ML
router.post('/analyze', textValidation, validateRequest, mlController.analyzeText);
router.post('/summarize', textValidation, validateRequest, mlController.generateSummary);
router.post('/classify', classificationValidation, validateRequest, mlController.classifyContent);
router.post('/entities', textValidation, validateRequest, mlController.extractEntities);
router.post('/generate', responseValidation, validateRequest, mlController.generateResponse);

export default router; 