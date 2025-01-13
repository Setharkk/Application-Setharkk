import api from '../index.ts';

interface WorkflowData {
  name: string;
  trigger: {
    type: string;
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: string;
    params: Record<string, any>;
  }>;
}

export const workflowService = {
  async createWorkflow(workflowData: WorkflowData) {
    const response = await api.post('/workflow', workflowData);
    return response.data;
  },

  async getWorkflows() {
    const response = await api.get('/workflow');
    return response.data;
  },

  async updateWorkflowStatus(workflowId: string, status: 'active' | 'draft' | 'paused') {
    const response = await api.patch(`/workflow/${workflowId}/status`, { status });
    return response.data;
  },

  async deleteWorkflow(workflowId: string) {
    const response = await api.delete(`/workflow/${workflowId}`);
    return response.data;
  }
}; 