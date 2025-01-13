import { Model } from 'objection';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';
import { WorkflowModel } from './workflowModel';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ExecutionData {
    result?: Record<string, any>;
    error?: string;
    action_data?: Record<string, any>;
}

export interface ExecutionStats {
    total: number;
    completed: number;
    failed: number;
    successRate: number;
    avgDuration: number;
}

export class ExecutionModel extends Model {
    id!: string;
    workflow_id!: string;
    status!: ExecutionStatus;
    trigger_data?: Record<string, any>;
    action_data?: Record<string, any>;
    result?: Record<string, any>;
    error?: string;
    started_at?: string;
    completed_at?: string;
    created_at!: string;
    updated_at!: string;

    static get tableName(): string {
        return 'automation_executions';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['workflow_id'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                workflow_id: { type: 'string', format: 'uuid' },
                status: {
                    type: 'string',
                    enum: ['pending', 'running', 'completed', 'failed'],
                    default: 'pending'
                },
                trigger_data: { type: 'object' },
                action_data: { type: 'object' },
                result: { type: 'object' },
                error: { type: 'string' },
                started_at: { type: 'string', format: 'date-time' },
                completed_at: { type: 'string', format: 'date-time' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        return {
            workflow: {
                relation: Model.BelongsToOneRelation,
                modelClass: WorkflowModel,
                join: {
                    from: 'automation_executions.workflow_id',
                    to: 'automation_workflows.id'
                }
            }
        };
    }

    async $beforeInsert(context: any): Promise<void> {
        await super.$beforeInsert(context);
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }

    async $beforeUpdate(opt: any, context: any): Promise<void> {
        await super.$beforeUpdate(opt, context);
        this.updated_at = new Date().toISOString();
    }

    static async createExecution(workflowId: string, triggerData?: Record<string, any>): Promise<ExecutionModel> {
        try {
            return await this.query().insert({
                workflow_id: workflowId,
                trigger_data: triggerData,
                status: 'pending' as ExecutionStatus,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Error in createExecution:', error);
            throw new Error('Failed to create execution');
        }
    }

    static async updateExecutionStatus(id: string, status: ExecutionStatus, data: ExecutionData = {}): Promise<void> {
        try {
            const updates: Partial<ExecutionModel> = {
                status,
                updated_at: new Date().toISOString()
            };

            if (status === 'running') {
                updates.started_at = new Date().toISOString();
            }

            if (status === 'completed' || status === 'failed') {
                updates.completed_at = new Date().toISOString();
            }

            if (data.result) {
                updates.result = data.result;
            }

            if (data.error) {
                updates.error = data.error;
            }

            if (data.action_data) {
                updates.action_data = data.action_data;
            }

            await this.query()
                .findById(id)
                .patch(updates);
        } catch (error) {
            logger.error('Error in updateExecutionStatus:', error);
            throw new Error('Failed to update execution status');
        }
    }

    static async getRecentExecutions(workflowId: string, limit: number = 10): Promise<ExecutionModel[]> {
        try {
            return await this.query()
                .where('workflow_id', workflowId)
                .orderBy('created_at', 'desc')
                .limit(limit);
        } catch (error) {
            logger.error('Error in getRecentExecutions:', error);
            throw new Error('Failed to fetch recent executions');
        }
    }

    static async getExecutionStats(workflowId: string): Promise<ExecutionStats> {
        try {
            const stats = await this.query()
                .where('workflow_id', workflowId)
                .select(
                    db.raw('COUNT(*) as total'),
                    db.raw("COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed"),
                    db.raw("COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed"),
                    db.raw('AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration')
                )
                .first();

            return {
                total: parseInt(stats.total),
                completed: parseInt(stats.completed),
                failed: parseInt(stats.failed),
                successRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
                avgDuration: parseFloat(stats.avg_duration || 0)
            };
        } catch (error) {
            logger.error('Error in getExecutionStats:', error);
            throw new Error('Failed to fetch execution stats');
        }
    }
} 