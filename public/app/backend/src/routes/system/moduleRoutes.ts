import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../middleware/validateRequest';
import * as moduleController from '../../controllers/moduleController';

const router = Router();

// Validation des modules
const moduleValidation = [
    body('name').isString().notEmpty().withMessage('Le nom du module est requis'),
    body('version').isString().notEmpty().withMessage('La version est requise'),
    body('dependencies').optional().isObject().withMessage('Les dépendances doivent être un objet'),
    body('config').optional().isObject().withMessage('La configuration doit être un objet')
];

// Routes des modules
router.get('/', moduleController.getAllModules);
router.get('/:id', moduleController.getModule);
router.post('/', moduleValidation, validateRequest, moduleController.createModule);
router.put('/:id', moduleValidation, validateRequest, moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);
router.post('/:id/enable', moduleController.enableModule);
router.post('/:id/disable', moduleController.disableModule);
router.get('/:id/status', moduleController.getModuleStatus);

export default router; 