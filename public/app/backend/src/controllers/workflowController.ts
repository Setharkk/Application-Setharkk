import { Request, Response } from 'express';
import { intelligentAgentService } from '../services/intelligentAgentService';
import { AppError } from '../errors/appError';
import logger from '../services/logger';

export const createWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const workflowData = req.body;
        
        if (!workflowData.name || !workflowData.trigger || !workflowData.actions) {
            throw new AppError('Données de workflow invalides', 400);
        }

        const workflow = await intelligentAgentService.createWorkflow(workflowData);
        res.json({
            status: 'success',
            data: workflow
        });
    } catch (error) {
        logger.error('Erreur lors de la création du workflow:', error);
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: 'error',
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Erreur interne du serveur'
            });
        }
    }
};

export const getWorkflows = async (req: Request, res: Response): Promise<void> => {
    try {
        const state = await intelligentAgentService.getAgentState();
        res.json({
            status: 'success',
            data: {
                activeWorkflows: state.activeWorkflows,
                metrics: state.performance.workflowMetrics
            }
        });
    } catch (error) {
        logger.error('Erreur lors de la récupération des workflows:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des workflows'
        });
    }
};

export const updateWorkflowStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workflowId } = req.params;
        const { status } = req.body;

        if (!workflowId || !status) {
            throw new AppError('ID du workflow et statut requis', 400);
        }

        if (!['active', 'draft', 'paused'].includes(status)) {
            throw new AppError('Statut invalide', 400);
        }

        await intelligentAgentService.updateWorkflowStatus(workflowId, status);
        res.json({
            status: 'success',
            message: 'Statut du workflow mis à jour avec succès'
        });
    } catch (error) {
        logger.error('Erreur lors de la mise à jour du statut du workflow:', error);
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: 'error',
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Erreur interne du serveur'
            });
        }
    }
};

export const deleteWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const { workflowId } = req.params;

        if (!workflowId) {
            throw new AppError('ID du workflow requis', 400);
        }

        await intelligentAgentService.deleteWorkflow(workflowId);
        res.json({
            status: 'success',
            message: 'Workflow supprimé avec succès'
        });
    } catch (error) {
        logger.error('Erreur lors de la suppression du workflow:', error);
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                status: 'error',
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Erreur interne du serveur'
            });
        }
    }
}; 