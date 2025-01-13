import express, { Request, Response, NextFunction } from 'express';
import { MLService } from '../../services/mlService';
import { logger } from '../../utils/logger';
import { AppError } from '../../errors/appError';

const router = express.Router();
const mlService = new MLService();

router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        if (!text) {
            throw new AppError('Le texte est requis', 400);
        }

        const sentiment = await mlService.analyzeSentiment(text);
        res.json(sentiment);
    } catch (error) {
        next(error);
    }
});

router.post('/summarize', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        if (!text) {
            throw new AppError('Le texte est requis', 400);
        }

        const summary = await mlService.generateSummary(text);
        res.json(summary);
    } catch (error) {
        next(error);
    }
});

router.post('/moderate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        if (!text) {
            throw new AppError('Le texte est requis', 400);
        }

        const result = await mlService.moderateContent(text);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router; 