import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller';

const router = Router();
const cacheController = new CacheController();

// Routes pour la gestion du cache
router.get('/keys', cacheController.getKeys);
router.get('/stats', cacheController.getStats);
router.delete('/clear', cacheController.clear);

// Routes pour les opérations sur les clés
router.get('/:key', cacheController.get);
router.put('/:key', cacheController.set);
router.delete('/:key', cacheController.delete);
router.get('/:key/ttl', cacheController.getTtl);
router.put('/:key/ttl', cacheController.setTtl);

export default router; 