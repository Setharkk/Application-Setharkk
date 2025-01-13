import { Request, Response } from 'express';
import { WorkflowModel } from '../models/automation/workflowModel';
import { ExecutionModel } from '../models/automation/executionModel';
import { logger } from '../utils/logger';
import { validateWorkflow } from '../validators/workflowValidator';

interface WorkflowQuery {
  status?: string;
  type?: string;
}

interface ExecutionQuery {
  limit?: number;
  offset?: number;
}

interface WorkflowToggle {
  active: boolean;
}

class AutomationController {
  async createWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { error } = validateWorkflow(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details
        });
        return;
      }

      const workflow = await WorkflowModel.query().insert(req.body);
      res.status(201).json(workflow);
    } catch (error) {
      logger.error('Error in createWorkflow:', error);
      res.status(500).json({
        error: 'Failed to create workflow'
      });
    }
  }

  async getWorkflows(req: Request<{}, {}, {}, WorkflowQuery>, res: Response): Promise<void> {
    try {
      const { status, type } = req.query;
      let query = WorkflowModel.query();

      if (status) {
        query = query.where('status', status);
      }

      if (type) {
        query = query.where('trigger_type', type);
      }

      const workflows = await query.orderBy('created_at', 'desc');
      res.json(workflows);
    } catch (error) {
      logger.error('Error in getWorkflows:', error);
      res.status(500).json({
        error: 'Failed to fetch workflows'
      });
    }
  }

  async getWorkflow(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const workflow = await WorkflowModel.findWithExecutions(req.params.id);
      if (!workflow) {
        res.status(404).json({
          error: 'Workflow not found'
        });
        return;
      }

      res.json(workflow);
    } catch (error) {
      logger.error('Error in getWorkflow:', error);
      res.status(500).json({
        error: 'Failed to fetch workflow'
      });
    }
  }

  async updateWorkflow(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { error } = validateWorkflow(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details
        });
        return;
      }

      const workflow = await WorkflowModel.query()
        .patchAndFetchById(req.params.id, req.body);

      if (!workflow) {
        res.status(404).json({
          error: 'Workflow not found'
        });
        return;
      }

      res.json(workflow);
    } catch (error) {
      logger.error('Error in updateWorkflow:', error);
      res.status(500).json({
        error: 'Failed to update workflow'
      });
    }
  }

  async deleteWorkflow(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const workflow = await WorkflowModel.query()
        .deleteById(req.params.id)
        .returning('*');

      if (!workflow) {
        res.status(404).json({
          error: 'Workflow not found'
        });
        return;
      }

      res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
      logger.error('Error in deleteWorkflow:', error);
      res.status(500).json({
        error: 'Failed to delete workflow'
      });
    }
  }

  async toggleWorkflow(req: Request<{ id: string }, {}, WorkflowToggle>, res: Response): Promise<void> {
    try {
      const workflow = await WorkflowModel.query()
        .patchAndFetchById(req.params.id, {
          is_active: req.body.active
        });

      if (!workflow) {
        res.status(404).json({
          error: 'Workflow not found'
        });
        return;
      }

      res.json(workflow);
    } catch (error) {
      logger.error('Error in toggleWorkflow:', error);
      res.status(500).json({
        error: 'Failed to toggle workflow'
      });
    }
  }

  async getWorkflowExecutions(req: Request<{ id: string }, {}, {}, ExecutionQuery>, res: Response): Promise<void> {
    try {
      const { limit = 10, offset = 0 } = req.query;
      
      const executions = await ExecutionModel.query()
        .where('workflow_id', req.params.id)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const stats = await ExecutionModel.getExecutionStats(req.params.id);

      res.json({
        executions,
        stats
      });
    } catch (error) {
      logger.error('Error in getWorkflowExecutions:', error);
      res.status(500).json({
        error: 'Failed to fetch workflow executions'
      });
    }
  }

  async retryExecution(req: Request<{ executionId: string }>, res: Response): Promise<void> {
    try {
      const execution = await ExecutionModel.query()
        .findById(req.params.executionId);

      if (!execution) {
        res.status(404).json({
          error: 'Execution not found'
        });
        return;
      }

      const newExecution = await ExecutionModel.createExecution(
        execution.workflow_id,
        execution.trigger_data
      );

      res.json(newExecution);
    } catch (error) {
      logger.error('Error in retryExecution:', error);
      res.status(500).json({
        error: 'Failed to retry execution'
      });
    }
  }

  async getWorkflowStats(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const stats = await ExecutionModel.getExecutionStats(req.params.id);
      res.json(stats);
    } catch (error) {
      logger.error('Error in getWorkflowStats:', error);
      res.status(500).json({
        error: 'Failed to fetch workflow stats'
      });
    }
  }
}

export default new AutomationController(); 