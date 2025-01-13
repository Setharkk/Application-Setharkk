import { Router } from 'express';
import chatRoutes from './chat';
import memoryRoutes from './memory';
import mlRoutes from './ml';
import agentRoutes from './agent';
import workflowRoutes from './workflow';
import monitoringRoutes from './monitoring';
import metricsRoutes from './metrics';
import seoRoutes from './seo';
import marketingRoutes from './marketing';
import crmRoutes from './crm';
import automationRoutes from './automation';
import errorRoutes from './error';
import systemRoutes from './system';
import learningRoutes from './learning';
import cacheRoutes from './cache';

const router = Router();

// Routes de base
router.use('/chat', chatRoutes);
router.use('/memory', memoryRoutes);
router.use('/ml', mlRoutes);
router.use('/agent', agentRoutes);
router.use('/workflow', workflowRoutes);

// Routes d'infrastructure
router.use('/monitoring', monitoringRoutes);
router.use('/metrics', metricsRoutes);
router.use('/system', systemRoutes);
router.use('/errors', errorRoutes);
router.use('/cache', cacheRoutes);

// Routes métier
router.use('/seo', seoRoutes);
router.use('/marketing', marketingRoutes);
router.use('/crm', crmRoutes);
router.use('/automation', automationRoutes);
router.use('/learning', learningRoutes);

// Route de santé générale
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

export default router; 