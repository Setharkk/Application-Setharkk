import { Request, Response, NextFunction } from 'express';
import { mlService } from '../services/mlService';
import { AppError } from '../errors/appError';
import logger from '../services/logger';

export const analyzeText = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        const analysis = await mlService.analyzeMessage(text);
        res.json(analysis);
    } catch (error) {
        next(new AppError('Erreur lors de l\'analyse du texte', 500));
    }
};

export const generateSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, maxLength } = req.body;
        const summary = await mlService.generateSummary(text, maxLength);
        res.json({ summary });
    } catch (error) {
        next(new AppError('Erreur lors de la génération du résumé', 500));
    }
};

export const classifyContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, categories } = req.body;
        const classification = await mlService.classifyContent(text, categories);
        res.json({ classification });
    } catch (error) {
        next(new AppError('Erreur lors de la classification', 500));
    }
};

export const extractEntities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        const entities = await mlService.extractEntities(text);
        res.json({ entities });
    } catch (error) {
        next(new AppError('Erreur lors de l\'extraction des entités', 500));
    }
};

export const generateResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { prompt, context, options } = req.body;
        
        // Vérification de la modération du contenu
        const isContentSafe = await mlService.moderateContent(prompt);
        if (!isContentSafe) {
            throw new AppError('Le contenu a été rejeté par la modération', 400);
        }

        const response = await mlService.generateResponse(prompt, context, options);
        res.json({ response });
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Erreur lors de la génération de la réponse', 500));
        }
    }
}; 