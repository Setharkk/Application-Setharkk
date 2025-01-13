import { Request, Response } from 'express';
import { ErrorModel } from '../models/errorModel';
import { ErrorInsights } from '../models/errorInsightsModel';

interface ErrorData {
    message: string;
    code: string;
    stack?: string;
    service: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export const logError = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, code, stack, service, severity }: ErrorData = req.body;
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
        res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
};

export const getInsights = async (req: Request, res: Response): Promise<void> => {
    try {
        const insights = await ErrorInsights.find()
            .sort({ occurrences: -1 })
            .limit(10);
        res.json(insights);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
}; 