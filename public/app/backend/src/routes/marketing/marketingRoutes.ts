import { Router } from 'express';
import { validate } from '../../middleware/validation';
import { body } from 'express-validator';
import { AppError } from '../../errors/appError';
import { marketingService } from '../../services/marketingService';
import { metricsService } from '../../services/metricsService';

const router = Router();

// Validation de la campagne
const campaignValidation = [
    body('name').notEmpty().withMessage('Nom de campagne requis'),
    body('type').isIn(['email', 'social', 'ads']).withMessage('Type de campagne invalide'),
    body('target').isObject().withMessage('Cible requise'),
    body('content').notEmpty().withMessage('Contenu requis')
];

// Créer une campagne
router.post('/campaigns', validate(campaignValidation), async (req, res, next) => {
    try {
        const result = await metricsService.measureOperation(
            'marketing',
            'create_campaign',
            async () => await marketingService.createCampaign(req.body)
        );
        res.status(201).json(result);
    } catch (error) {
        next(new AppError('Erreur lors de la création de la campagne', 400));
    }
});

// Obtenir les analyses
router.get('/analytics', async (req, res, next) => {
    try {
        const result = await metricsService.measureOperation(
            'marketing',
            'get_analytics',
            async () => await marketingService.getAnalytics(req.query)
        );
        res.json(result);
    } catch (error) {
        next(new AppError('Erreur lors de la récupération des analyses', 500));
    }
});

// Générer du contenu
router.post('/generate-content', 
    validate([
        body('type').isIn(['email', 'social', 'ad']).withMessage('Type de contenu invalide'),
        body('parameters').isObject().withMessage('Paramètres requis')
    ]), 
    async (req, res, next) => {
        try {
            const result = await metricsService.measureOperation(
                'marketing',
                'generate_content',
                async () => await marketingService.generateContent(req.body.type, req.body.parameters)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de la génération du contenu', 500));
        }
    }
);

// Optimiser une campagne
router.post('/optimize/:campaignId',
    validate([
        body('parameters').isObject().withMessage('Paramètres d\'optimisation requis')
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureOperation(
                'marketing',
                'optimize_campaign',
                async () => await marketingService.optimizeCampaign(req.params.campaignId, req.body.parameters)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de l\'optimisation de la campagne', 500));
        }
    }
);

export default router; 