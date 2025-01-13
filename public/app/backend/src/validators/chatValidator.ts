import { body } from 'express-validator';

export const messageValidation = [
    body('message')
        .isString()
        .notEmpty()
        .withMessage('Le message est requis'),
    body('context')
        .optional()
        .isObject()
        .withMessage('Le contexte doit être un objet')
];

export const contextValidation = [
    body('context')
        .isObject()
        .notEmpty()
        .withMessage('Le contexte est requis')
]; 