import { Request, Response, NextFunction } from 'express';
import { systemService } from '../services/systemService';
import { logger } from '../utils/logger';
import { AppError } from '../errors/appError';

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await systemService.getSystemStats();
        res.json(stats);
    } catch (error) {
        logger.error('Erreur lors de la récupération des statistiques système', error as Error);
        next(error);
    }
};

export const diagnoseProblem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const diagnosis = await systemService.diagnoseProblem(req.body);
        res.json(diagnosis);
    } catch (error) {
        logger.error('Erreur lors du diagnostic système', error as Error);
        next(error);
    }
};

export const optimizeSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await systemService.optimizeSystem(req.body);
        res.json(result);
    } catch (error) {
        logger.error('Erreur lors de l\'optimisation système', error as Error);
        next(error);
    }
};

export const backupSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await systemService.backupSystem(req.body);
        res.json(result);
    } catch (error) {
        logger.error('Erreur lors de la sauvegarde système', error as Error);
        next(error);
    }
};

export const restoreSystem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.backupPath) {
            throw new AppError('Chemin de sauvegarde requis', 400);
        }

        const result = await systemService.restoreSystem(req.body);
        res.json(result);
    } catch (error) {
        logger.error('Erreur lors de la restauration système', error as Error);
        next(error);
    }
}; 