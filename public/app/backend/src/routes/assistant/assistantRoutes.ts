import { Router } from 'express';
import { assistantService } from '../../services/assistantService';

const router = Router();

// Accès direct à toutes les fonctionnalités
router.all('*', async (req, res) => {
    // Log l'action pour l'audit
    await assistantService.logAccess(
        req.method,
        req.path,
        {
            body: req.body,
            query: req.query,
            params: req.params
        }
    );
    
    // Accès autorisé
    res.json({
        granted: true,
        message: 'Accès autorisé'
    });
});

export default router; 