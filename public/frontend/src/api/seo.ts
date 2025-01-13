import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface AnalysisResponse {
    score: number;
    suggestions: Array<{
        type: string;
        content: string;
    }>;
}

interface ChatResponse {
    message: string;
    suggestions?: Array<{
        type: string;
        content: string;
    }>;
}

interface SuggestionResponse {
    suggestions: Array<{
        type: string;
        content: string;
        priority: number;
    }>;
}

const API_URL: string = process.env.VUE_APP_API_URL || '';
const API_TIMEOUT: number = 30000; // 30 secondes

const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const seoApi = {
    analyze: async (url: string): Promise<AnalysisResponse> => {
        try {
            const response: AxiosResponse<AnalysisResponse> = await apiClient.post('/api/seo/ai/analyze', { url });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur lors de l\'analyse de l\'URL'
                    : 'Erreur lors de l\'analyse de l\'URL'
            );
        }
    },

    chat: async (message: string, context?: string): Promise<ChatResponse> => {
        try {
            const response: AxiosResponse<ChatResponse> = await apiClient.post('/api/seo/ai/chat', { message, context });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur lors de l\'envoi du message'
                    : 'Erreur lors de l\'envoi du message'
            );
        }
    },

    suggestions: async (url: string): Promise<SuggestionResponse> => {
        try {
            const response: AxiosResponse<SuggestionResponse> = await apiClient.post('/api/seo/ai/suggestions', { url });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des suggestions:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur lors de la récupération des suggestions'
                    : 'Erreur lors de la récupération des suggestions'
            );
        }
    }
}; 