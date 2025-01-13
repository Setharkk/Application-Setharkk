import { Request, Response } from 'express';
import { agentService } from '../services';

export class AgentController {
  async processInput(req: Request, res: Response) {
    try {
      const { input, userId } = req.body;
      
      if (!input || !userId) {
        return res.status(400).json({
          error: 'Input et userId sont requis'
        });
      }

      const response = await agentService.processInput(input, userId);
      res.json({
        status: 'success',
        data: response
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors du traitement de l\'input',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getState(req: Request, res: Response) {
    try {
      const state = await agentService.getState();
      res.json({
        status: 'success',
        data: state
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération de l\'état',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async updateContext(req: Request, res: Response) {
    try {
      const { context } = req.body;
      
      if (!context || typeof context !== 'object') {
        return res.status(400).json({
          error: 'Contexte invalide'
        });
      }

      await agentService.updateContext(context);
      res.json({
        status: 'success',
        message: 'Contexte mis à jour avec succès'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la mise à jour du contexte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
} 