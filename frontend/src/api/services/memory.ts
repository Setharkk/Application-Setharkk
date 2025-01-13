import api from '../index.ts';

export const memoryService = {
  async updateMemory(data: Record<string, any>) {
    const response = await api.post('/memory/update', { data });
    return response.data;
  },

  async getContext(sessionId: string) {
    const response = await api.get(`/memory/context/${sessionId}`);
    return response.data;
  },

  async getState() {
    const response = await api.get('/memory/state');
    return response.data;
  },

  async learnPattern(pattern: Record<string, any>) {
    const response = await api.post('/memory/learn', { pattern });
    return response.data;
  }
}; 