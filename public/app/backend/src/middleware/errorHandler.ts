import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { eventBus } from '../events/eventBus';
import logger from '../services/logger';
import { config } from '../config';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Erreur:', error);

    // Émettre l'événement d'erreur
    eventBus.emit('error', {
        error,
        request: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body
        }
    });

    // Si c'est une erreur AppError
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
            errors: error.errors,
            ...(config.app.env === 'development' && { stack: error.stack })
        });
    }

    // Erreur par défaut
    return res.status(500).json({
        status: 'error',
        message: config.app.env === 'development' ? error.message : 'Erreur interne du serveur',
        ...(config.app.env === 'development' && { stack: error.stack })
    });
}; 