import { Request, Response } from 'express';
import { systemService } from '../services';
import logger from '../services/logger';

export class SystemController {
    async getSystemStatus(req: Request, res: Response) {
        try {
            const status = await systemService.getSystemStatus();
            res.json(status);
        } catch (error) {
            logger.error('Erreur lors de la récupération du statut système:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération du statut système' });
        }
    }

    async getSystemResources(req: Request, res: Response) {
        try {
            const resources = await systemService.getSystemResources();
            res.json(resources);
        } catch (error) {
            logger.error('Erreur lors de la récupération des ressources:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des ressources' });
        }
    }

    async getSystemLogs(req: Request, res: Response) {
        try {
            const { level, service, startDate, endDate } = req.query;
            const logs = await systemService.getSystemLogs({
                level: level as 'error' | 'info' | 'warn' | 'debug',
                service: service as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined
            });
            res.json(logs);
        } catch (error) {
            logger.error('Erreur lors de la récupération des logs:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
        }
    }

    async getSystemConfig(req: Request, res: Response) {
        try {
            const config = await systemService.getSystemConfig();
            res.json(config);
        } catch (error) {
            logger.error('Erreur lors de la récupération de la configuration:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' });
        }
    }

    async updateSystemConfig(req: Request, res: Response) {
        try {
            const configData = req.body;
            const updated = await systemService.updateSystemConfig(configData);
            res.json(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour de la configuration:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour de la configuration' });
        }
    }

    async getSystemDiagnostics(req: Request, res: Response) {
        try {
            const diagnostics = await systemService.getSystemDiagnostics();
            res.json(diagnostics);
        } catch (error) {
            logger.error('Erreur lors de la récupération des diagnostics:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des diagnostics' });
        }
    }

    async performSystemMaintenance(req: Request, res: Response) {
        try {
            const { type } = req.body;
            const result = await systemService.performSystemMaintenance(type);
            res.json(result);
        } catch (error) {
            logger.error('Erreur lors de la maintenance système:', error);
            res.status(500).json({ error: 'Erreur lors de la maintenance système' });
        }
    }
} 