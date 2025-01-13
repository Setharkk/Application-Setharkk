import { Router, Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { auth } from '../middleware/auth';

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}

const router = Router();

// Route pour envoyer un message
router.post('/message', auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Le message est requis'
            });
        }

        const response = await chatService.processMessage(userId, message);
        res.json(response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du traitement du message'
        });
    }
});

// Route pour les actions rapides
router.post('/action', auth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { action } = req.body;
        const userId = req.user.id;

        if (!action) {
            return res.status(400).json({
                success: false,
                error: 'L\'action est requise'
            });
        }

        const response = await chatService.processAction(userId, action);
        res.json(response);
    } catch (error) {
        console.error('Erreur lors de l\'exécution de l\'action:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du traitement de l\'action'
        });
    }
});

// Route pour effacer le contexte de la conversation
router.post('/clear', auth, (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const response = chatService.clearContext(userId);
        res.json(response);
    } catch (error) {
        console.error('Erreur lors de l\'effacement du contexte:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'effacement du contexte'
        });
    }
});

export default router; 