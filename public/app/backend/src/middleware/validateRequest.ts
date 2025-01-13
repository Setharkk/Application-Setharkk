import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../errors/appError';

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const messages = errors.array().map(err => err.msg);
        throw new AppError(messages.join(', '), 400);
    }
    
    next();
}; 