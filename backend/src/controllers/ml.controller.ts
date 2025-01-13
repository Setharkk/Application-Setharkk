import { Request, Response } from 'express';
import { mlService } from '../services';

export class MLController {
  async analyzeText(req: Request, res: Response) {
    try {
      const { text } = req.body;
      const analysis = await mlService.analyzeText(text);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de l\'analyse du texte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async generateSummary(req: Request, res: Response) {
    try {
      const { text, maxLength } = req.body;
      const summary = await mlService.generateSummary(text, maxLength);
      res.json({ summary });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la génération du résumé',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async classifyContent(req: Request, res: Response) {
    try {
      const { text, categories } = req.body;
      const classification = await mlService.classifyContent(text, categories);
      res.json({ classification });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la classification',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async extractEntities(req: Request, res: Response) {
    try {
      const { text } = req.body;
      const entities = await mlService.extractEntities(text);
      res.json({ entities });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de l\'extraction des entités',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async generateResponse(req: Request, res: Response) {
    try {
      const { prompt, context, options } = req.body;
      
      // Vérification de la modération du contenu
      const isContentSafe = await mlService.moderateContent(prompt);
      if (!isContentSafe) {
        return res.status(400).json({
          error: 'Le contenu a été rejeté par la modération'
        });
      }

      const response = await mlService.generateResponse(prompt, context, options);
      res.json({ response });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la génération de la réponse',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
} 