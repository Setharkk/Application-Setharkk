import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { auth } from '../middleware/auth';

const router = Router();

// Appliquer l'authentification à toutes les routes
router.use(auth);

// Obtenir tous les rapports
router.get('/', reportController.getReports);

// Créer un nouveau rapport
router.post('/', reportController.createReport);

// Mettre à jour un rapport
router.put('/:id', reportController.updateReport);

// Supprimer un rapport
router.delete('/:id', reportController.deleteReport);

// Générer un rapport immédiatement
router.post('/:id/generate', reportController.generateReport);

export default router; 