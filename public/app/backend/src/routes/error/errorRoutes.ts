import express, { Request, Response, NextFunction } from 'express';
import { errorService } from '../../services/errorService';
import { logger } from '../../utils/logger';

const router = express.Router();

// Routes de gestion des erreurs
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, severity } = req.query;
        const errors = errorService.getErrors(
            limit ? parseInt(limit as string) : undefined,
            severity as 'low' | 'medium' | 'high' | 'critical'
        );
        res.json(errors);
    } catch (error) {
        next(error);
    }
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = errorService.getErrorStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        errorService.clearErrors();
        res.json({ message: 'Journal des erreurs nettoyé' });
    } catch (error) {
        next(error);
    }
});

export default router; 