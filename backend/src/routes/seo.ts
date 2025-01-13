import { Router } from 'express';
import { SEOController } from '../controllers/seo.controller';

const router = Router();
const seoController = new SEOController();

// Route pour analyser une URL
router.post('/analyze', seoController.analyzeUrl);

// Route pour obtenir l'historique des analyses
router.get('/history', seoController.getAnalysisHistory);

// Route pour générer des recommandations
router.get('/recommendations/:analysisId', seoController.generateRecommendations);

// Route pour obtenir les classements des mots-clés
router.get('/rankings', seoController.getKeywordRankings);

export default router; 