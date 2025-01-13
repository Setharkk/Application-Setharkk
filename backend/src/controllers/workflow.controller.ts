import { Request, Response } from 'express';
import { workflowService } from '../services';

export class WorkflowController {
  async createWorkflow(req: Request, res: Response) {
    try {
      const workflowData = req.body;
      
      if (!workflowData.name || !workflowData.trigger || !workflowData.actions) {
        return res.status(400).json({
          error: 'Données de workflow invalides'
        });
      }

      const workflow = await workflowService.createWorkflow(workflowData);
      res.json({
        status: 'success',
        data: workflow
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la création du workflow',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async getWorkflows(req: Request, res: Response) {
    try {
      const workflows = await workflowService.getWorkflows();
      res.json({
        status: 'success',
        data: workflows
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la récupération des workflows',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async updateWorkflowStatus(req: Request, res: Response) {
    try {
      const { workflowId } = req.params;
      const { status } = req.body;

      if (!workflowId || !status) {
        return res.status(400).json({
          error: 'ID du workflow et statut requis'
        });
      }

      if (!['active', 'draft', 'paused'].includes(status)) {
        return res.status(400).json({
          error: 'Statut invalide'
        });
      }

      await workflowService.updateWorkflowStatus(workflowId, status);
      res.json({
        status: 'success',
        message: 'Statut du workflow mis à jour avec succès'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la mise à jour du statut du workflow',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  async deleteWorkflow(req: Request, res: Response) {
    try {
      const { workflowId } = req.params;

      if (!workflowId) {
        return res.status(400).json({
          error: 'ID du workflow requis'
        });
      }

      await workflowService.deleteWorkflow(workflowId);
      res.json({
        status: 'success',
        message: 'Workflow supprimé avec succès'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur lors de la suppression du workflow',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }
} 