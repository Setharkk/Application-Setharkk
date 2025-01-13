import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import logger from '../services/logger';
import { chatService } from '../services/chatService';

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, context } = req.body;
        const response = await chatService.sendMessage(message, context);
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        logger.error('Erreur lors de l\'envoi du message:', error);
        next(new AppError('Erreur lors de l\'envoi du message', 500));
    }
};

export const getContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const context = await chatService.getContext();
        
        res.status(200).json({
            success: true,
            data: { context }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération du contexte:', error);
        next(new AppError('Erreur lors de la récupération du contexte', 500));
    }
};

export const updateContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { context } = req.body;
        const updatedContext = await chatService.updateContext(context);
        
        res.status(200).json({
            success: true,
            data: { context: updatedContext }
        });
    } catch (error) {
        logger.error('Erreur lors de la mise à jour du contexte:', error);
        next(new AppError('Erreur lors de la mise à jour du contexte', 500));
    }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string);
        
        const history = await chatService.getHistory(page, pageSize);
        
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération de l\'historique:', error);
        next(new AppError('Erreur lors de la récupération de l\'historique', 500));
    }
};

export const searchMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string);
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        if (!query) {
            throw new AppError('Le paramètre de recherche est requis', 400);
        }

        const results = await chatService.searchMessages({
            query: query as string,
            page,
            pageSize,
            startDate,
            endDate
        });

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        logger.error('Erreur lors de la recherche des messages:', error);
        next(error instanceof AppError ? error : new AppError('Erreur lors de la recherche des messages', 500));
    }
}; 