import { Request, Response } from 'express';
import { errorService } from '../services';
import logger from '../services/logger';
import { ErrorStatus } from '../types/error';

export class ErrorController {
    async logError(req: Request, res: Response) {
        try {
            const errorData = req.body;
            const error = await errorService.logError(errorData);
            res.json(error);
        } catch (error) {
            logger.error('Erreur lors de l\'enregistrement de l\'erreur:', error);
            res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'erreur' });
        }
    }

    async getErrors(req: Request, res: Response) {
        try {
            const { severity, status, startDate, endDate } = req.query;
            const errors = await errorService.getErrors({
                severity: severity as 'low' | 'medium' | 'high',
                status: status as ErrorStatus,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined
            });
            res.json(errors);
        } catch (error) {
            logger.error('Erreur lors de la récupération des erreurs:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des erreurs' });
        }
    }

    async getErrorDetails(req: Request, res: Response) {
        try {
            const { errorId } = req.params;
            const error = await errorService.getErrorDetails(errorId);
            res.json(error);
        } catch (error) {
            logger.error('Erreur lors de la récupération des détails:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
        }
    }

    async updateErrorStatus(req: Request, res: Response) {
        try {
            const { errorId } = req.params;
            const { status, resolution } = req.body;
            const updated = await errorService.updateErrorStatus(errorId, status, resolution);
            res.json(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
        }
    }

    async getErrorStats(req: Request, res: Response) {
        try {
            const { period } = req.query;
            const stats = await errorService.getErrorStats(period as string);
            res.json(stats);
        } catch (error) {
            logger.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
        }
    }

    async deleteError(req: Request, res: Response) {
        try {
            const { errorId } = req.params;
            await errorService.deleteError(errorId);
            res.json({ message: 'Erreur supprimée avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la suppression:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    }
} 