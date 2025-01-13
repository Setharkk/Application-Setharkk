import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';

interface ActionParameters {
    command?: string;
    script?: string;
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    timeout?: number;
    retries?: number;
}

interface ConditionParameters {
    field?: string;
    operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value?: string | number | boolean;
    threshold?: number;
    duration?: number;
    expression?: string;
}

interface TaskMetadata {
    creator?: string;
    department?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    cost?: number;
    notes?: string[];
    customFields?: Record<string, string | number | boolean>;
}

interface TaskResult {
    success: boolean;
    data?: unknown;
    error?: {
        message: string;
        code: string;
        details?: Record<string, unknown>;
    };
    metrics?: {
        duration: number;
        retries: number;
        timestamp: Date;
    };
}

interface AutomationTask {
    id: string;
    name: string;
    description?: string;
    schedule: string;
    enabled: boolean;
    lastRun?: Date;
    nextRun?: Date;
    status: 'idle' | 'running' | 'failed' | 'completed';
    type: 'cron' | 'interval' | 'event';
    action: {
        type: string;
        params: ActionParameters;
    };
    conditions?: {
        type: string;
        params: ConditionParameters;
    }[];
    retryPolicy?: {
        maxAttempts: number;
        delay: number;
    };
    timeout?: number;
    tags?: string[];
    metadata?: TaskMetadata;
}

interface AutomationHistory {
    taskId: string;
    startTime: Date;
    endTime?: Date;
    status: 'success' | 'failure';
    error?: string;
    duration?: number;
    result?: TaskResult;
}

interface AutomationStats {
    total: number;
    running: number;
    failed: number;
    completed: number;
    successRate: number;
    averageDuration: number;
}

export class AutomationService extends BaseService {
    private readonly tasks: Map<string, AutomationTask>;
    private history: AutomationHistory[];
    private readonly maxHistorySize = 1000;
    private readonly workflows: Record<string, unknown>[] = [];
    private readonly workflowHistory: Record<string, unknown>[] = [];

    constructor() {
        super(
            {
                id: 'automation-service',
                name: 'Automation Service',
                type: ServiceType.INFRASTRUCTURE,
                dependencies: ['scheduler-service', 'event-service']
            },
            {
                version: '1.0.0',
                description: 'Manages automated tasks and workflows in the system',
                author: 'System Team',
                tags: ['automation', 'tasks', 'workflows']
            }
        );
        
        logger.info('AutomationService initialized');
        
        this.tasks = new Map();
        this.history = [];
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Service d\'automatisation initialisé');
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Service d\'automatisation arrêté');
        this.tasks.clear();
        this.history = [];
    }

    async createTask(task: Omit<AutomationTask, 'id' | 'status'>): Promise<AutomationTask> {
        try {
            const id = this.generateTaskId();
            const newTask: AutomationTask = {
                ...task,
                id,
                status: 'idle'
            };

            this.tasks.set(id, newTask);
            logger.info(`Nouvelle tâche automatisée créée: ${id}`);
            
            if (newTask.enabled) {
                await this.scheduleTask(newTask);
            }

            return newTask;
        } catch (error) {
            logger.error('Erreur lors de la création de la tâche:', error);
            throw error;
        }
    }

    async getTask(id: string): Promise<AutomationTask | null> {
        return this.tasks.get(id) || null;
    }

    async listTasks(filter?: {
        enabled?: boolean;
        status?: AutomationTask['status'];
        type?: AutomationTask['type'];
        tags?: string[];
    }): Promise<AutomationTask[]> {
        try {
            let tasks = Array.from(this.tasks.values());

            if (filter) {
                tasks = tasks.filter(task => {
                    if (filter.enabled !== undefined && task.enabled !== filter.enabled) return false;
                    if (filter.status && task.status !== filter.status) return false;
                    if (filter.type && task.type !== filter.type) return false;
                    if (filter.tags && filter.tags.length > 0) {
                        return filter.tags.some(tag => task.tags?.includes(tag));
                    }
                    return true;
                });
            }

            return tasks;
        } catch (error) {
            logger.error('Erreur lors de la récupération des tâches:', error);
            throw error;
        }
    }

    async updateTask(id: string, updates: Partial<Omit<AutomationTask, 'id'>>): Promise<AutomationTask> {
        try {
            const task = this.tasks.get(id);
            if (!task) {
                throw new Error(`Tâche non trouvée: ${id}`);
            }

            const updatedTask = { ...task, ...updates };
            this.tasks.set(id, updatedTask);

            if (updates.enabled !== undefined) {
                if (updates.enabled) {
                    await this.scheduleTask(updatedTask);
                } else {
                    await this.unscheduleTask(id);
                }
            }

            logger.info(`Tâche mise à jour: ${id}`);
            return updatedTask;
        } catch (error) {
            logger.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
            throw error;
        }
    }

    async deleteTask(id: string): Promise<void> {
        try {
            await this.unscheduleTask(id);
            this.tasks.delete(id);
            logger.info(`Tâche supprimée: ${id}`);
        } catch (error) {
            logger.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
            throw error;
        }
    }

    async getTaskHistory(taskId?: string, limit = 100): Promise<AutomationHistory[]> {
        try {
            let history = [...this.history];
            
            if (taskId) {
                history = history.filter(h => h.taskId === taskId);
            }

            const sortedHistory = [...history].sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
            return sortedHistory.slice(0, limit);
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'historique:', error);
            throw error;
        }
    }

    async getStats(timeRange?: { start: Date; end: Date }): Promise<AutomationStats> {
        try {
            let history = this.history;
            
            if (timeRange) {
                history = history.filter(h => 
                    h.startTime >= timeRange.start && 
                    h.startTime <= timeRange.end
                );
            }

            const total = history.length;
            const successful = history.filter(h => h.status === 'success').length;
            const durations = history
                .filter(h => h.duration !== undefined)
                .map(h => h.duration);

            return {
                total,
                running: Array.from(this.tasks.values()).filter(t => t.status === 'running').length,
                failed: history.filter(h => h.status === 'failure').length,
                completed: successful,
                successRate: total > 0 ? (successful / total) * 100 : 0,
                averageDuration: durations.length > 0 
                    ? durations.filter(d => d !== undefined).reduce((a, b) => (a || 0) + (b || 0), 0) / durations.filter(d => d !== undefined).length
                    : 0
            };
        } catch (error) {
            logger.error('Erreur lors du calcul des statistiques:', error);
            throw error;
        }
    }

    private generateTaskId(): string {
        return `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    private async scheduleTask(task: AutomationTask): Promise<void> {
        // Implémentation de la planification selon le type de tâche
        try {
            switch (task.type) {
                case 'cron':
                    // Utiliser node-cron ou similar
                    break;
                case 'interval':
                    // Utiliser setInterval
                    break;
                case 'event':
                    // Configurer les écouteurs d'événements
                    break;
            }
        } catch (error) {
            logger.error(`Erreur lors de la planification de la tâche ${task.id}:`, error);
            throw error;
        }
    }

    private async unscheduleTask(taskId: string): Promise<void> {
        // Annuler la planification de la tâche
        try {
            const task = this.tasks.get(taskId);
            if (!task) return;

            switch (task.type) {
                case 'cron':
                    // Annuler la tâche cron
                    break;
                case 'interval':
                    // Annuler l'intervalle
                    break;
                case 'event':
                    // Supprimer les écouteurs d'événements
                    break;
            }
        } catch (error) {
            logger.error(`Erreur lors de l'annulation de la planification de la tâche ${taskId}:`, error);
            throw error;
        }
    }

    public async createWorkflow(workflowData: Record<string, unknown>): Promise<Record<string, unknown>> {
        const workflow = {
            ...workflowData,
            id: `workflow_${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'draft'
        };
        this.workflows.push(workflow);
        return workflow;
    }

    public async getWorkflows(filters: { status?: string; type?: string } = {}): Promise<Record<string, unknown>[]> {
        return this.workflows.filter(workflow => {
            if (filters.status && workflow.status !== filters.status) return false;
            if (filters.type && workflow.type !== filters.type) return false;
            return true;
        });
    }

    public async getWorkflowDetails(workflowId: string): Promise<Record<string, unknown>> {
        const workflow = this.workflows.find(w => w.id === workflowId);
        if (!workflow) throw new Error('Workflow non trouvé');
        return workflow;
    }

    public async updateWorkflow(workflowId: string, updateData: Record<string, unknown>): Promise<Record<string, unknown>> {
        const index = this.workflows.findIndex(w => w.id === workflowId);
        if (index === -1) throw new Error('Workflow non trouvé');
        
        this.workflows[index] = {
            ...this.workflows[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        return this.workflows[index];
    }

    public async deleteWorkflow(workflowId: string): Promise<void> {
        const index = this.workflows.findIndex(w => w.id === workflowId);
        if (index === -1) throw new Error('Workflow non trouvé');
        this.workflows.splice(index, 1);
    }

    public async executeWorkflow(workflowId: string): Promise<Record<string, unknown>> {
        const workflow = await this.getWorkflowDetails(workflowId);
        
        const result = {
            workflowId,
            startTime: new Date().toISOString(),
            status: 'completed',
            result: { success: true },
            workflow
        };

        this.workflowHistory.push({
            ...result,
            timestamp: result.startTime
        });

        return result;
    }

    public async getWorkflowHistory(workflowId: string): Promise<Record<string, unknown>[]> {
        return this.workflowHistory.filter(entry => entry.workflowId === workflowId)
            .sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());
    }

    public async toggleWorkflow(workflowId: string, enabled: boolean): Promise<Record<string, unknown>> {
        const workflow = await this.getWorkflowDetails(workflowId);
        return this.updateWorkflow(workflowId, { ...workflow, enabled, updatedAt: new Date().toISOString() });
    }
}

export const automationService = new AutomationService(); 