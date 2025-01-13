import express from 'express';
import authRoutes from './auth/authRoutes';
import learningRoutes from './learning/learningRoutes';
import systemRoutes from './system/systemRoutes';
import analysisRoutes from './analysis/analysisRoutes';
import automationRoutes from './automation/automationRoutes';
import errorRoutes from './error/errorRoutes';
import { config } from '../config';

const router = express.Router();

// Préfixe global pour l'API
const apiPrefix = config.app.apiPrefix;

// Routes d'authentification
router.use(`${apiPrefix}/auth`, authRoutes);

// Routes d'apprentissage
router.use(`${apiPrefix}/learning`, learningRoutes);

// Routes système
router.use(`${apiPrefix}/system`, systemRoutes);

// Routes d'analyse
router.use(`${apiPrefix}/analysis`, analysisRoutes);

// Routes d'automatisation
router.use(`${apiPrefix}/automation`, automationRoutes);

// Routes de gestion des erreurs
router.use(`${apiPrefix}/errors`, errorRoutes);

// Route de santé
router.get(`${apiPrefix}/health`, (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

export default router; 