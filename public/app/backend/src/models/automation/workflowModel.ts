import { Model } from 'objection';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';
import { ExecutionModel } from './executionModel';

export type WorkflowStatus = 'active' | 'paused' | 'error';

export interface TriggerConfig {
    [key: string]: any;
}

export interface ActionConfig {
    [key: string]: any;
}

export class WorkflowModel extends Model {
    id!: string;
    name!: string;
    description?: string;
    trigger_type!: string;
    trigger_config!: TriggerConfig;
    action_type!: string;
    action_config!: ActionConfig;
    status!: WorkflowStatus;
    is_active!: boolean;
    created_at!: string;
    updated_at!: string;

    static get tableName(): string {
        return 'automation_workflows';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'trigger_type', 'action_type'],
            properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string', minLength: 1, maxLength: 255 },
                description: { type: 'string', maxLength: 1000 },
                trigger_type: { type: 'string' },
                trigger_config: { type: 'object' },
                action_type: { type: 'string' },
                action_config: { type: 'object' },
                status: { 
                    type: 'string',
                    enum: ['active', 'paused', 'error']
                },
                is_active: { type: 'boolean', default: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        return {
            executions: {
                relation: Model.HasManyRelation,
                modelClass: ExecutionModel,
                join: {
                    from: 'automation_workflows.id',
                    to: 'automation_executions.workflow_id'
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

    static async findWithExecutions(id: string): Promise<WorkflowModel & { executions: ExecutionModel[] }> {
        try {
            return await this.query()
                .findById(id)
                .withGraphFetched('executions');
        } catch (error) {
            logger.error('Error in findWithExecutions:', error);
            throw new Error('Failed to fetch workflow with executions');
        }
    }

    static async findActiveWorkflows(): Promise<WorkflowModel[]> {
        try {
            return await this.query()
                .where('is_active', true)
                .where('status', 'active');
        } catch (error) {
            logger.error('Error in findActiveWorkflows:', error);
            throw new Error('Failed to fetch active workflows');
        }
    }

    static async updateStatus(id: string, status: WorkflowStatus): Promise<void> {
        try {
            await this.query()
                .findById(id)
                .patch({
                    status,
                    updated_at: new Date().toISOString()
                });
        } catch (error) {
            logger.error('Error in updateStatus:', error);
            throw new Error('Failed to update workflow status');
        }
    }
} 