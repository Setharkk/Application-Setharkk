import { Request, Response } from 'express';
import { intelligentAgentService } from '../services/intelligentAgentService';
import { AppError } from '../errors/appError';
import logger from '../services/logger';

export const processInput = async (req: Request, res: Response): Promise<void> => {
    try {
        const { input, userId } = req.body;
        
        if (!input || !userId) {
            throw new AppError('Input et userId sont requis', 400);
        }

        const response = await intelligentAgentService.processInput(input, userId);
        res.json({
            status: 'success',
            data: response
        });
    } catch (error) {
        logger.error('Erreur lors du traitement de l\'input:', error);
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: 'error',
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Erreur interne du serveur'
            });
        }
    }
};

export const getAgentState = async (req: Request, res: Response): Promise<void> => {
    try {
        const state = await intelligentAgentService.getAgentState();
        res.json({
            status: 'success',
            data: state
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération de l\'état de l\'agent:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération de l\'état'
        });
    }
};

export const updateContext = async (req: Request, res: Response): Promise<void> => {
    try {
        const { context } = req.body;
        
        if (!context || typeof context !== 'object') {
            throw new AppError('Contexte invalide', 400);
        }

        await intelligentAgentService.updateContext(context);
        res.json({
            status: 'success',
            message: 'Contexte mis à jour avec succès'
        });
    } catch (error) {
        logger.error('Erreur lors de la mise à jour du contexte:', error);
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: 'error',
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Erreur interne du serveur'
            });
        }
    }
}; 