import express, { Request, Response, NextFunction } from 'express';
import {
    getSystemStats,
    diagnoseProblem,
    optimizeSystem,
    backupSystem,
    restoreSystem
} from '../../controllers/systemController';

const router = express.Router();

// Routes système
router.get('/stats', (req: Request, res: Response, next: NextFunction) => getSystemStats(req, res, next));
router.post('/diagnose', (req: Request, res: Response, next: NextFunction) => diagnoseProblem(req, res, next));
router.post('/optimize', (req: Request, res: Response, next: NextFunction) => optimizeSystem(req, res, next));
router.post('/backup', (req: Request, res: Response, next: NextFunction) => backupSystem(req, res, next));
router.post('/restore', (req: Request, res: Response, next: NextFunction) => restoreSystem(req, res, next));

export default router; 