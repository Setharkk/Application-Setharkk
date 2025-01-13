import { Router } from 'express';
import { ErrorController } from '../controllers/error.controller';

const router = Router();
const errorController = new ErrorController();

// Routes pour la gestion des erreurs
router.post('/', errorController.logError);
router.get('/', errorController.getErrors);
router.get('/stats', errorController.getErrorStats);
router.get('/:errorId', errorController.getErrorDetails);
router.put('/:errorId/status', errorController.updateErrorStatus);
router.delete('/:errorId', errorController.deleteError);

export default router; 