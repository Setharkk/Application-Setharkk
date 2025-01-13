import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { orchestratorService } from '../services/orchestratorService';
import logger from '../services/logger';

// Conversation
export const chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, context } = req.body;
        const userId = req.user.id;

        const response = await orchestratorService.processMessage(message, userId, context);
        res.json(response);
    } catch (error) {
        next(new AppError('Erreur lors du traitement du message', 500));
    }
};

export const streamResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, context } = req.body;
        const userId = req.user.id;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await orchestratorService.streamResponse(message, userId, context);
        stream.on('data', (chunk: Buffer) => res.write(`data: ${chunk}\n\n`));
        stream.on('end', () => res.end());
    } catch (error) {
        next(new AppError('Erreur lors du streaming de la réponse', 500));
    }
};

// Contexte
export const getContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const context = await orchestratorService.getContext(userId);
        res.json(context);
    } catch (error) {
        next(new AppError('Erreur lors de la récupération du contexte', 500));
    }
};

export const updateContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { context } = req.body;
        const userId = req.user.id;
        
        const updatedContext = await orchestratorService.updateContext(userId, context);
        res.json(updatedContext);
    } catch (error) {
        next(new AppError('Erreur lors de la mise à jour du contexte', 500));
    }
};

export const clearContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        await orchestratorService.clearContext(userId);
        res.json({ message: 'Contexte effacé avec succès' });
    } catch (error) {
        next(new AppError('Erreur lors de l\'effacement du contexte', 500));
    }
};

// Historique
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const history = await orchestratorService.getHistory(userId, page, limit);
        res.json(history);
    } catch (error) {
        next(new AppError('Erreur lors de la récupération de l\'historique', 500));
    }
};

export const clearHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        await orchestratorService.clearHistory(userId);
        res.json({ message: 'Historique effacé avec succès' });
    } catch (error) {
        next(new AppError('Erreur lors de l\'effacement de l\'historique', 500));
    }
}; 