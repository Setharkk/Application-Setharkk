import api from '../index.ts';

export const mlService = {
  async analyzeText(text: string) {
    const response = await api.post('/ml/analyze', { text });
    return response.data;
  },

  async generateSummary(text: string, maxLength?: number) {
    const response = await api.post('/ml/summary', { text, maxLength });
    return response.data;
  },

  async classifyContent(text: string, categories: string[]) {
    const response = await api.post('/ml/classify', { text, categories });
    return response.data;
  },

  async extractEntities(text: string) {
    const response = await api.post('/ml/entities', { text });
    return response.data;
  },

  async generateResponse(prompt: string, context?: Record<string, any>, options?: Record<string, any>) {
    const response = await api.post('/ml/generate', { prompt, context, options });
    return response.data;
  }
}; 