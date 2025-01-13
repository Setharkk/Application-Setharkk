import { Router } from 'express';
import { validate } from '../../middleware/validation';
import { body, query } from 'express-validator';
import { AppError } from '../../errors/appError';
import { analysisService } from '../../services/analysisService';
import { metricsService } from '../../services/metricsService';

const router = Router();

// Analyser un texte
router.post('/text', 
    validate([
        body('text').notEmpty().withMessage('Texte requis'),
        body('options').optional().isObject()
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureOperation(
                'analysis',
                'analyze_text',
                async () => await analysisService.analyzeText(req.body.text, req.body.options)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de l\'analyse du texte', 500));
        }
    }
);

// Obtenir des statistiques
router.get('/stats',
    validate([
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('type').optional().isString()
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureOperation(
                'analysis',
                'get_stats',
                async () => await analysisService.getStats(req.query)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de la récupération des statistiques', 500));
        }
    }
);

// Générer un rapport
router.post('/report',
    validate([
        body('type').isIn(['performance', 'usage', 'errors']).withMessage('Type de rapport invalide'),
        body('parameters').isObject().withMessage('Paramètres requis')
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureOperation(
                'analysis',
                'generate_report',
                async () => await analysisService.generateReport(req.body.type, req.body.parameters)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de la génération du rapport', 500));
        }
    }
);

export default router; 