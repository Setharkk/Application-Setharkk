import { Router } from 'express';
import { validate } from '../../middleware/validation';
import { body } from 'express-validator';
import { AppError } from '../../errors/appError';
import { seoService } from '../../services/seoService';
import { metricsService } from '../../services/metricsService';

const router = Router();

// Validation de l'analyse SEO
const seoAnalysisValidation = [
    body('url').isURL().withMessage('URL invalide'),
    body('options').optional().isObject()
];

// Analyser une URL
router.post('/analyze', validate(seoAnalysisValidation), async (req, res, next) => {
    try {
        const result = await metricsService.measureMLOperation(
            'seo',
            'analyze_url',
            async () => await seoService.analyzeUrl(req.body.url, req.body.options)
        );
        res.json(result);
    } catch (error) {
        next(new AppError('Erreur lors de l\'analyse SEO', 500));
    }
});

// Obtenir des suggestions d'optimisation
router.post('/suggestions',
    validate([
        body('content').notEmpty().withMessage('Contenu requis'),
        body('keywords').isArray().withMessage('Mots-clés requis')
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureMLOperation(
                'seo',
                'get_suggestions',
                async () => await seoService.getSuggestions(req.body.content, req.body.keywords)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de la génération des suggestions', 500));
        }
    }
);

// Générer des méta-données
router.post('/meta',
    validate([
        body('content').notEmpty().withMessage('Contenu requis'),
        body('type').isIn(['title', 'description', 'keywords']).withMessage('Type invalide')
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureMLOperation(
                'seo',
                'generate_meta',
                async () => await seoService.generateMeta(req.body.content, req.body.type)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de la génération des méta-données', 500));
        }
    }
);

// Vérifier le classement
router.post('/ranking',
    validate([
        body('keyword').notEmpty().withMessage('Mot-clé requis'),
        body('url').isURL().withMessage('URL invalide')
    ]),
    async (req, res, next) => {
        try {
            const result = await metricsService.measureMLOperation(
                'seo',
                'check_ranking',
                async () => await seoService.checkRanking(req.body.keyword, req.body.url)
            );
            res.json(result);
        } catch (error) {
            next(new AppError('Erreur lors de la vérification du classement', 500));
        }
    }
);

export default router; 