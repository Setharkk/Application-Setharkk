import { Request, Response } from 'express';
import { MemoryService } from '../services/memoryService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const memoryService = new MemoryService();

/**
 * @description Met à jour la mémoire du système
 */
export const updateMemory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data } = req.body;
    const result = await memoryService.update(data);
    res.json({
      status: 'success',
      data: { updated: result }
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la mémoire:', error);
    throw new AppError('Erreur lors de la mise à jour de la mémoire', 500);
  }
};

/**
 * @description Récupère le contexte de la mémoire
 */
export const getMemoryContext = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = await memoryService.getContext();
    res.json({
      status: 'success',
      data: context
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du contexte:', error);
    throw new AppError('Erreur lors de la récupération du contexte', 500);
  }
};

/**
 * @description Récupère l'état de la mémoire
 */
export const getMemoryState = async (req: Request, res: Response): Promise<void> => {
  try {
    const state = await memoryService.getState();
    res.json({
      status: 'success',
      data: state
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'état:', error);
    throw new AppError('Erreur lors de la récupération de l\'état', 500);
  }
};

/**
 * @description Enregistre un nouveau pattern d'apprentissage
 */
export const learnPattern = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pattern } = req.body;
    await memoryService.identifyPatterns(pattern);
    res.json({
      status: 'success',
      message: 'Pattern enregistré avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de l\'apprentissage du pattern:', error);
    throw new AppError('Erreur lors de l\'apprentissage du pattern', 500);
  }
};

/**
 * @description Récupère le statut d'apprentissage
 */
export const getLearningStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = {
      active: true,
      progress: 75,
      patterns: {
        total: 100,
        learned: 75,
        pending: 25
      },
      lastUpdate: new Date().toISOString()
    };
    res.json({
      status: 'success',
      data: status
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du statut d\'apprentissage:', error);
    throw new AppError('Erreur lors de la récupération du statut d\'apprentissage', 500);
  }
}; 