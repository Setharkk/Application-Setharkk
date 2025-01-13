import axios from 'axios';
import { Logger } from '../utils/logger';

interface SentimentAnalysis {
    score: number;
    label: string;
}

export interface MessageAnalysis {
    intent: string;
    sentiment: SentimentAnalysis;
    entities: Record<string, any>;
}

export class MLService {
    private logger: Logger;
    private apiUrl: string;

    constructor() {
        this.logger = new Logger('MLService');
        this.apiUrl = process.env.ML_API_URL || 'http://localhost:5000/api/ml';
    }

    async analyzeMessage(message: string): Promise<MessageAnalysis> {
        try {
            const response = await axios.post(`${this.apiUrl}/analyze`, { message });
            return response.data;
        } catch (error) {
            this.logger.error('Erreur lors de l\'analyse du message:', error);
            throw error;
        }
    }

    async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
        try {
            const response = await axios.post(`${this.apiUrl}/sentiment`, { text });
            return response.data;
        } catch (error) {
            this.logger.error('Erreur lors de l\'analyse du sentiment:', error);
            throw error;
        }
    }

    async generateSummary(text: string): Promise<string> {
        try {
            const response = await axios.post(`${this.apiUrl}/summarize`, { text });
            return response.data.summary;
        } catch (error) {
            this.logger.error('Erreur lors de la génération du résumé:', error);
            throw error;
        }
    }

    async moderateContent(text: string): Promise<boolean> {
        try {
            const response = await axios.post(`${this.apiUrl}/moderate`, { text });
            return response.data.isAllowed;
        } catch (error) {
            this.logger.error('Erreur lors de la modération du contenu:', error);
            throw error;
        }
    }

    async generateSuggestions(text: string): Promise<string[]> {
        try {
            const response = await axios.post(`${this.apiUrl}/suggestions`, { text });
            return response.data.suggestions;
        } catch (error) {
            this.logger.error('Erreur lors de la génération des suggestions:', error);
            throw error;
        }
    }
} 