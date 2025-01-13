import api from '../index.ts';

export const chatService = {
  async sendMessage(message: string, context?: Record<string, any>) {
    const response = await api.post('/chat', { message, context });
    return response.data;
  },

  async getHistory(sessionId: string, page = 1, pageSize = 20) {
    const response = await api.get(`/chat/history/${sessionId}`, {
      params: { page, pageSize }
    });
    return response.data;
  }
}; 