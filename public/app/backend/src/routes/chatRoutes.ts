import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import * as chatController from '../controllers/chatController';

const router = Router();

// Validation des messages
const messageValidation = [
    body('message').isString().notEmpty().withMessage('Le message est requis'),
    body('context').optional().isObject().withMessage('Le contexte doit être un objet')
];

// Validation de la recherche
const searchValidation = [
    query('query').isString().notEmpty().withMessage('Le terme de recherche est requis'),
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un nombre positif'),
    query('pageSize').optional().isInt({ min: 1 }).withMessage('La taille de la page doit être un nombre positif'),
    query('startDate').optional().isISO8601().withMessage('La date de début doit être une date valide'),
    query('endDate').optional().isISO8601().withMessage('La date de fin doit être une date valide')
];

// Routes du chat
router.post('/message', messageValidation, validateRequest, chatController.sendMessage);
router.get('/context', chatController.getContext);
router.post('/context/update', validateRequest, chatController.updateContext);
router.get('/history', chatController.getHistory);
router.get('/search', searchValidation, validateRequest, chatController.searchMessages);

export default router; 