import { Request, Response } from 'express';
import { ModuleService } from '../services/moduleService';
import logger from '../services/logger';
import { AppError } from '../errors/appError';

const moduleService = new ModuleService();

/**
 * @description Liste tous les modules disponibles
 */
export const listModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const modules = moduleService.listModules();
    res.json({
      status: 'success',
      data: modules
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des modules:', error);
    throw new AppError('Erreur lors de la récupération des modules', 500);
  }
};

/**
 * @description Exécute une action sur un module spécifique
 */
export const executeModuleAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId, action } = req.params;
    const { params } = req.body;
    const result = await moduleService.executeAction(moduleId, action, params);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Erreur lors de l\'exécution de l\'action:', error);
    throw new AppError('Erreur lors de l\'exécution de l\'action', 500);
  }
};

/**
 * @description Charge un module
 */
export const loadModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const { config } = req.body;
    const success = await moduleService.loadModule(moduleId, config);
    res.json({
      status: 'success',
      data: { loaded: success }
    });
  } catch (error) {
    logger.error('Erreur lors du chargement du module:', error);
    throw new AppError('Erreur lors du chargement du module', 500);
  }
};

/**
 * @description Décharge un module
 */
export const unloadModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const success = await moduleService.unloadModule(moduleId);
    res.json({
      status: 'success',
      data: { unloaded: success }
    });
  } catch (error) {
    logger.error('Erreur lors du déchargement du module:', error);
    throw new AppError('Erreur lors du déchargement du module', 500);
  }
}; 