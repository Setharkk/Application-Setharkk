import { Request, Response } from 'express';
import { cacheService } from '../services';
import logger from '../services/logger';

export class CacheController {
    async get(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const value = await cacheService.get(key);
            if (value === null) {
                res.status(404).json({ error: 'Clé non trouvée dans le cache' });
            } else {
                res.json({ key, value });
            }
        } catch (error) {
            logger.error('Erreur lors de la récupération depuis le cache:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération depuis le cache' });
        }
    }

    async set(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const { value, ttl } = req.body;
            cacheService.set(key, value, ttl);
            res.json({ message: 'Valeur mise en cache avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la mise en cache:', error);
            res.status(500).json({ error: 'Erreur lors de la mise en cache' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { key } = req.params;
            cacheService.delete(key);
            res.json({ message: 'Clé supprimée du cache avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la suppression du cache:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du cache' });
        }
    }

    async clear(req: Request, res: Response) {
        try {
            cacheService.clear();
            res.json({ message: 'Cache vidé avec succès' });
        } catch (error) {
            logger.error('Erreur lors du vidage du cache:', error);
            res.status(500).json({ error: 'Erreur lors du vidage du cache' });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const stats = await cacheService.getStats();
            res.json(stats);
        } catch (error) {
            logger.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
        }
    }

    async getKeys(req: Request, res: Response) {
        try {
            const { pattern } = req.query;
            const keys = await cacheService.getKeys(pattern as string);
            res.json(keys);
        } catch (error) {
            logger.error('Erreur lors de la récupération des clés:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des clés' });
        }
    }

    async getTtl(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const ttl = await cacheService.getTtl(key);
            res.json({ key, ttl });
        } catch (error) {
            logger.error('Erreur lors de la récupération du TTL:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération du TTL' });
        }
    }

    async setTtl(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const { ttl } = req.body;
            cacheService.setTtl(key, ttl);
            res.json({ message: 'TTL mis à jour avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du TTL:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du TTL' });
        }
    }
} 