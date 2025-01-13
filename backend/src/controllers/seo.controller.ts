import { Request, Response } from 'express';
import { seoService } from '../services';
import logger from '../services/logger';

export class SEOController {
    async analyzeUrl(req: Request, res: Response) {
        try {
            const { url } = req.body;
            const analysis = await seoService.analyzeUrl(url);
            res.json(analysis);
        } catch (error) {
            logger.error('Erreur lors de l\'analyse SEO:', error);
            res.status(500).json({ error: 'Erreur lors de l\'analyse SEO' });
        }
    }

    async getAnalysisHistory(req: Request, res: Response) {
        try {
            const { url } = req.query;
            const history = await seoService.getAnalysisHistory(url as string);
            res.json(history);
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'historique:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
        }
    }

    async generateRecommendations(req: Request, res: Response) {
        try {
            const { analysisId } = req.params;
            const recommendations = await seoService.generateRecommendations(analysisId);
            res.json(recommendations);
        } catch (error) {
            logger.error('Erreur lors de la génération des recommandations:', error);
            res.status(500).json({ error: 'Erreur lors de la génération des recommandations' });
        }
    }

    async getKeywordRankings(req: Request, res: Response) {
        try {
            const { url, keywords } = req.query;
            const rankings = await seoService.getKeywordRankings(url as string, keywords as string[]);
            res.json(rankings);
        } catch (error) {
            logger.error('Erreur lors de la récupération des classements:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des classements' });
        }
    }
} 