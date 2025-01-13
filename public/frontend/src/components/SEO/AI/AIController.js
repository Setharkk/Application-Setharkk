import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || '';
const AI_ENDPOINTS = {
  analyze: `${API_URL}/api/seo/ai/analyze`,
  chat: `${API_URL}/api/seo/ai/chat`,
  suggestions: `${API_URL}/api/seo/ai/suggestions`
};

export const useAIController = () => {
  const analyzeUrl = async (url) => {
    try {
      const response = await axios.post(AI_ENDPOINTS.analyze, { url });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'analyse de l\'URL');
    }
  };

  const sendMessage = async (message, context = []) => {
    try {
      const response = await axios.post(AI_ENDPOINTS.chat, {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const getSuggestions = async (url) => {
    try {
      const response = await axios.post(AI_ENDPOINTS.suggestions, { url });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des suggestions');
    }
  };

  const formatAnalysisResults = (data) => {
    if (!data) return null;

    return {
      score: data.score || 0,
      categories: {
        content: {
          score: data.contentScore || 0,
          suggestions: data.contentSuggestions || []
        },
        technical: {
          score: data.technicalScore || 0,
          suggestions: data.technicalSuggestions || []
        },
        performance: {
          score: data.performanceScore || 0,
          suggestions: data.performanceSuggestions || []
        }
      }
    };
  };

  const formatSuggestions = (data) => {
    if (!data) return [];

    return data.map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority || 'medium',
      category: suggestion.category || 'general',
      impact: suggestion.impact || 'moderate'
    }));
  };

  return {
    analyzeUrl,
    sendMessage,
    getSuggestions,
    formatAnalysisResults,
    formatSuggestions
  };
}; 