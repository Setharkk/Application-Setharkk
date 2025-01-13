import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import * as moduleController from '../controllers/moduleController';

const router = Router();

// Validation
const actionValidation = [
    body('params').optional().isObject().withMessage('Les paramètres doivent être un objet')
];

const configValidation = [
    body('config').isObject().withMessage('La configuration est requise')
];

// Routes
router.get('/', moduleController.listModules);
router.post('/:moduleId/action/:action', actionValidation, validateRequest, moduleController.executeModuleAction);
router.post('/:moduleId/load', configValidation, validateRequest, moduleController.loadModule);
router.post('/:moduleId/unload', moduleController.unloadModule);

export default router; 