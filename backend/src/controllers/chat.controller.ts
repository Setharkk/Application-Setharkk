import { Request, Response } from 'express';
import { chatService } from '../services';

export class ChatController {
  async handleMessage(req: Request, res: Response) {
    try {
      const { message, context } = req.body;
      const response = await chatService.sendMessage(message, context);
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors du traitement du message',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const history = chatService.getHistory(
        sessionId,
        Number(page),
        Number(pageSize)
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération de l\'historique',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
} 