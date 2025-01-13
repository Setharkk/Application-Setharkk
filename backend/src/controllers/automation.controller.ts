import { Request, Response } from 'express';
import { automationService } from '../services';
import logger from '../services/logger';

export class AutomationController {
    async createWorkflow(req: Request, res: Response) {
        try {
            const workflowData = req.body;
            const workflow = await automationService.createWorkflow(workflowData);
            res.json(workflow);
        } catch (error) {
            logger.error('Erreur lors de la création du workflow:', error);
            res.status(500).json({ error: 'Erreur lors de la création du workflow' });
        }
    }

    async getWorkflows(req: Request, res: Response) {
        try {
            const { status, type } = req.query;
            const workflows = await automationService.getWorkflows({
                status: status as string,
                type: type as string
            });
            res.json(workflows);
        } catch (error) {
            logger.error('Erreur lors de la récupération des workflows:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des workflows' });
        }
    }

    async getWorkflowDetails(req: Request, res: Response) {
        try {
            const { workflowId } = req.params;
            const workflow = await automationService.getWorkflowDetails(workflowId);
            res.json(workflow);
        } catch (error) {
            logger.error('Erreur lors de la récupération des détails du workflow:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des détails du workflow' });
        }
    }

    async updateWorkflow(req: Request, res: Response) {
        try {
            const { workflowId } = req.params;
            const updateData = req.body;
            const updated = await automationService.updateWorkflow(workflowId, updateData);
            res.json(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du workflow:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du workflow' });
        }
    }

    async deleteWorkflow(req: Request, res: Response) {
        try {
            const { workflowId } = req.params;
            await automationService.deleteWorkflow(workflowId);
            res.json({ message: 'Workflow supprimé avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la suppression du workflow:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du workflow' });
        }
    }

    async executeWorkflow(req: Request, res: Response) {
        try {
            const { workflowId } = req.params;
            const result = await automationService.executeWorkflow(workflowId);
            res.json(result);
        } catch (error) {
            logger.error('Erreur lors de l\'exécution du workflow:', error);
            res.status(500).json({ error: 'Erreur lors de l\'exécution du workflow' });
        }
    }

    async getWorkflowHistory(req: Request, res: Response) {
        try {
            const { workflowId } = req.params;
            const history = await automationService.getWorkflowHistory(workflowId);
            res.json(history);
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'historique:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
        }
    }

    async toggleWorkflow(req: Request, res: Response) {
        try {
            const { workflowId } = req.params;
            const { enabled } = req.body;
            const status = await automationService.toggleWorkflow(workflowId, enabled);
            res.json(status);
        } catch (error) {
            logger.error('Erreur lors du changement d\'état du workflow:', error);
            res.status(500).json({ error: 'Erreur lors du changement d\'état du workflow' });
        }
    }
} 