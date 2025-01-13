import axios from 'axios';
import { Workflow, WorkflowStep, AutomationExecution } from '../types';

export interface MakeConfig {
    apiKey: string;
    baseUrl: string;
}

export class MakeService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(config: MakeConfig) {
        this.baseUrl = config.baseUrl;
        this.headers = {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async getWorkflow(id: string): Promise<Workflow> {
        try {
            const response = await axios.get<{ data: Workflow }>(
                `${this.baseUrl}/workflows/${id}`,
                { headers: this.headers }
            );

            const data = response.data?.data ?? null;
            if (!data) {
                throw new Error('Invalid response format');
            }

            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération du workflow:', error);
            throw error;
        }
    }

    async createWorkflow(workflow: Omit<Workflow, 'id'>): Promise<Workflow> {
        try {
            const response = await axios.post<{ data: Workflow }>(
                `${this.baseUrl}/workflows`,
                workflow,
                { headers: this.headers }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la création du workflow:', error);
            throw error;
        }
    }

    async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
        try {
            const response = await axios.put<{ data: Workflow }>(
                `${this.baseUrl}/workflows/${id}`,
                workflow,
                { headers: this.headers }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du workflow:', error);
            throw error;
        }
    }

    async executeWorkflow(id: string, input: Record<string, unknown>): Promise<AutomationExecution> {
        try {
            const response = await axios.post<{ data: AutomationExecution }>(
                `${this.baseUrl}/workflows/${id}/execute`,
                { input },
                { headers: this.headers }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de l\'exécution du workflow:', error);
            throw error;
        }
    }

    async getExecution(id: string): Promise<AutomationExecution> {
        try {
            const response = await axios.get<{ data: AutomationExecution }>(
                `${this.baseUrl}/executions/${id}`,
                { headers: this.headers }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'exécution:', error);
            throw error;
        }
    }

    async listWorkflows(page: number = 1, limit: number = 10): Promise<{
        workflows: Workflow[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const response = await axios.get<{
                data: {
                    workflows: Workflow[];
                    total: number;
                    page: number;
                    limit: number;
                }
            }>(
                `${this.baseUrl}/workflows`,
                {
                    params: { page, limit },
                    headers: this.headers
                }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste des workflows:', error);
            throw error;
        }
    }

    async getWorkflowStep(workflowId: string, stepId: string): Promise<WorkflowStep> {
        try {
            const response = await axios.get<{ data: WorkflowStep }>(
                `${this.baseUrl}/workflows/${workflowId}/steps/${stepId}`,
                { headers: this.headers }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'étape du workflow:', error);
            throw error;
        }
    }

    async updateWorkflowStep(workflowId: string, stepId: string, step: Partial<WorkflowStep>): Promise<WorkflowStep> {
        try {
            const response = await axios.put<{ data: WorkflowStep }>(
                `${this.baseUrl}/workflows/${workflowId}/steps/${stepId}`,
                step,
                { headers: this.headers }
            );

            if (!response.data?.data) {
                throw new Error('Invalid response format');
            }

            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'étape du workflow:', error);
            throw error;
        }
    }
} 