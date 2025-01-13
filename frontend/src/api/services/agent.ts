import api from '../index.ts';

export const agentService = {
  async processInput(input: string, userId: string) {
    const response = await api.post('/agent/process', { input, userId });
    return response.data;
  },

  async getState() {
    const response = await api.get('/agent/state');
    return response.data;
  },

  async updateContext(context: Record<string, any>) {
    const response = await api.post('/agent/context', { context });
    return response.data;
  }
}; 