import { Request, Response } from 'express';
import { memoryService } from '../services';

export class MemoryController {
  async updateMemory(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const result = await memoryService.update(data);
      res.json({
        status: 'success',
        data: { updated: result }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la mise à jour de la mémoire',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getContext(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const context = await memoryService.getContext(sessionId);
      res.json({
        status: 'success',
        data: context
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération du contexte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getState(req: Request, res: Response) {
    try {
      const state = await memoryService.getState();
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

  async learnPattern(req: Request, res: Response) {
    try {
      const { pattern } = req.body;
      await memoryService.learnPattern(pattern);
      res.json({
        status: 'success',
        message: 'Pattern enregistré avec succès'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de l\'apprentissage du pattern',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
} 