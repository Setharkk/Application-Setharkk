import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, query, param } from 'express-validator';
import { AppError } from '../errors/appError';

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const formattedErrors = errors.array().reduce((acc: Record<string, string[]>, error: any) => {
            const field = error.param;
            if (!acc[field]) {
                acc[field] = [];
            }
            acc[field].push(error.msg);
            return acc;
        }, {});

        const appError = new AppError('Erreur de validation', 400);
        appError.errors = formattedErrors;
        next(appError);
    };
};

// Validations communes
export const commonValidations = {
    pagination: [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    ],
    userId: [
        param('userId').isString().notEmpty().withMessage('ID utilisateur invalide')
    ],
    messageContent: [
        body('message').isString().trim().notEmpty().withMessage('Le message est requis')
            .isLength({ max: 1000 }).withMessage('Le message est trop long')
    ],
    context: [
        body('context').optional().isObject().withMessage('Le contexte doit être un objet')
    ]
};

// Validations spécifiques
export const assistantValidations = {
    chat: [
        ...commonValidations.messageContent,
        ...commonValidations.context
    ],
    updateContext: [
        body('context').isObject().notEmpty().withMessage('Le contexte est requis')
    ],
    getHistory: [
        ...commonValidations.pagination
    ]
}; 