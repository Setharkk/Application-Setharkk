import { Router, Request, Response } from 'express';
import { ErrorModel } from '../models/errorModel';
import { ErrorInsights } from '../models/errorInsightsModel';

interface ErrorLogRequest {
    message: string;
    code: string;
    stack: string;
    service: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorResponse<T> {
    error?: string;
    data?: T;
}

const router = Router();

router.post('/log', async (req: Request<{}, {}, ErrorLogRequest>, res: Response) => {
    try {
        const { message, code, stack, service, severity } = req.body;
        const error = new ErrorModel({
            message,
            code,
            stack,
            service,
            severity
        });
        await error.save();
        res.status(201).json(error);
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as ErrorResponse<never>);
    }
});

router.get('/insights', async (_req: Request, res: Response) => {
    try {
        const insights = await ErrorInsights.find()
            .sort({ occurrences: -1 })
            .limit(10);
        res.json(insights);
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as ErrorResponse<never>);
    }
});

export default router; 