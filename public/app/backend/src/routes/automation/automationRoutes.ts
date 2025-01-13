import express, { Request, Response, NextFunction } from 'express';
import { automationService } from '../../services/automationService';
import { logger } from '../../utils/logger';
import { AppError } from '../../errors/appError';

const router = express.Router();

// Routes d'automatisation
router.post('/tasks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            throw new AppError('Le nom et la description sont requis', 400);
        }

        const task = await automationService.createTask(name, description);
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
});

router.get('/tasks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await automationService.getAllTasks();
        res.json(tasks);
    } catch (error) {
        next(error);
    }
});

router.get('/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const task = await automationService.getTask(req.params.id);
        if (!task) {
            throw new AppError('Tâche non trouvée', 404);
        }
        res.json(task);
    } catch (error) {
        next(error);
    }
});

router.patch('/tasks/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        if (!status) {
            throw new AppError('Le statut est requis', 400);
        }

        const task = await automationService.updateTaskStatus(req.params.id, status);
        if (!task) {
            throw new AppError('Tâche non trouvée', 404);
        }
        res.json(task);
    } catch (error) {
        next(error);
    }
});

router.delete('/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deleted = await automationService.deleteTask(req.params.id);
        if (!deleted) {
            throw new AppError('Tâche non trouvée', 404);
        }
        res.json({ message: 'Tâche supprimée' });
    } catch (error) {
        next(error);
    }
});

export default router; 