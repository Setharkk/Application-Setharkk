import express from 'express';
import { body } from 'express-validator';
import * as errorCorrectionController from '../controllers/errorCorrectionController';
import { authenticate, authorizeAssistant } from '../middleware/auth';

const router = express.Router();

// Middleware de validation
const validateErrorRequest = [
    body('error').isObject().withMessage('L\'erreur doit être un objet'),
    body('error.message').isString().notEmpty().withMessage('Le message d\'erreur est requis'),
    body('context').isObject().withMessage('Le contexte doit être un objet')
];

// Routes de base pour la correction d'erreurs
router.post('/handle',
    authenticate,
    authorizeAssistant,
    validateErrorRequest,
    errorCorrectionController.handleError
);

router.get('/history',
    authenticate,
    errorCorrectionController.getErrorHistory
);

router.post('/analyze',
    authenticate,
    authorizeAssistant,
    validateErrorRequest,
    errorCorrectionController.analyzeError
);

router.post('/suggestions',
    authenticate,
    authorizeAssistant,
    validateErrorRequest,
    errorCorrectionController.getSuggestions
);

export default router; 