import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorCorrectionService } from '../services/errorCorrectionService';
import { logger } from '../utils/logger';
import { AppError } from '../errors/appError';

export const handleError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError('Validation échouée', 400, errors.mapped());
        }

        const { error, context } = req.body;
        const result = await errorCorrectionService.handleError(error, context);
        
        res.json(result);
    } catch (error) {
        logger.error('Erreur lors du traitement de la correction:', error);
        next(error instanceof AppError ? error : new AppError('Erreur lors du traitement de la correction', 500));
    }
};

export const getErrorHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const history = await errorCorrectionService.getErrorHistory(limit);
        
        res.json({
            success: true,
            history
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération de l\'historique:', error);
        next(error instanceof AppError ? error : new AppError('Erreur lors de la récupération de l\'historique', 500));
    }
};

export const analyzeError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError('Validation échouée', 400, errors.mapped());
        }

        const { error, context } = req.body;
        const analysis = await errorCorrectionService.analyzeAndSuggest(error, context);
        
        res.json(analysis);
    } catch (error) {
        logger.error('Erreur lors de l\'analyse:', error);
        next(error instanceof AppError ? error : new AppError('Erreur lors de l\'analyse', 500));
    }
};

export const getSuggestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError('Validation échouée', 400, errors.mapped());
        }

        const { error, context } = req.body;
        const suggestions = await errorCorrectionService.generateSuggestions(error, context);
        
        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        logger.error('Erreur lors de la génération des suggestions:', error);
        next(error instanceof AppError ? error : new AppError('Erreur lors de la génération des suggestions', 500));
    }
}; 