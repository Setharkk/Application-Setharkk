import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = Router();
const chatController = new ChatController();

// Route pour envoyer un message
router.post('/', chatController.handleMessage);

// Route pour récupérer l'historique des messages
router.get('/history/:sessionId', chatController.getHistory);

export default router;