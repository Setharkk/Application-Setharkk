import { RabbitMQ } from '../../utils/RabbitMQ';
import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';
import { OpenAIService } from '../ai/OpenAIService';
import { SeoAnalysis } from '../types';

interface AnalysisResult {
    title: string;
    description: string;
    keywords: string[];
    score: number;
    recommendations: string[];
}

export interface SeoServiceConfig {
    elasticsearch: ElasticsearchConfig;
    rabbitmq: {
        url: string;
    };
    openai: {
        apiKey: string;
    };
}

export class SeoService {
    private readonly elasticsearch: ElasticsearchService;
    private readonly rabbitmq: RabbitMQ;
    private readonly openai: OpenAIService;
    private readonly INDEX_PREFIX = 'seo';
    private readonly QUEUE_PREFIX = 'seo';

    constructor(config: SeoServiceConfig) {
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
        this.openai = new OpenAIService(config.openai.apiKey);
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            await this.createIndices();
            await this.setupQueues();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service SEO:', error);
            throw error;
        }
    }

    private async createIndices(): Promise<void> {
        try {
            // Index des analyses SEO
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_analyses`, {
                properties: {
                    id: { type: 'keyword' },
                    url: { type: 'keyword' },
                    title: { type: 'text' },
                    description: { type: 'text' },
                    keywords: { type: 'keyword' },
                    score: { type: 'float' },
                    recommendations: {
                        properties: {
                            title: { type: 'text' },
                            description: { type: 'text' },
                            keywords: { type: 'keyword' },
                            content: { type: 'text' },
                            technical: { type: 'text' }
                        }
                    },
                    timestamp: { type: 'date' }
                }
            });

            // Index des rapports
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_reports`, {
                properties: {
                    id: { type: 'keyword' },
                    urls: { type: 'keyword' },
                    summary: { type: 'text' },
                    recommendations: { type: 'text' },
                    score: { type: 'float' },
                    createdAt: { type: 'date' }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la création des indices:', error);
            throw error;
        }
    }

    private async setupQueues(): Promise<void> {
        try {
            await this.rabbitmq.createQueue(`${this.QUEUE_PREFIX}_events`);
            await this.rabbitmq.createQueue(`${this.QUEUE_PREFIX}_tasks`);
        } catch (error) {
            console.error('Erreur lors de la configuration des files d\'attente:', error);
            throw error;
        }
    }

    async analyzePage(url: string): Promise<SeoAnalysis> {
        try {
            const response = await this.openai.analyze(url);
            const analysisResult = JSON.parse(response) as AnalysisResult;
            const analysis: SeoAnalysis = {
                url,
                title: analysisResult.title || '',
                description: analysisResult.description || '',
                keywords: analysisResult.keywords || [],
                score: analysisResult.score || 0,
                recommendations: analysisResult.recommendations || [],
                timestamp: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_analyses`,
                analysis.url,
                analysis as unknown as Record<string, unknown>
            );

            return analysis;
        } catch (error) {
            console.error('Erreur lors de l\'analyse SEO:', error);
            throw error;
        }
    }

    async optimizePage(content: string): Promise<string> {
        try {
            return await this.openai.analyze(`Optimize this content for SEO: ${content}`);
        } catch (error) {
            console.error('Erreur lors de l\'optimisation de la page:', error);
            throw error;
        }
    }

    async getAnalysis(id: string): Promise<SeoAnalysis | null> {
        try {
            return await this.elasticsearch.get<SeoAnalysis>(
                `${this.INDEX_PREFIX}_analyses`,
                id
            );
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'analyse:', error);
            return null;
        }
    }

    async searchAnalyses(query: string): Promise<SeoAnalysis[]> {
        try {
            const searchQuery = {
                multi_match: {
                    query,
                    fields: ['url', 'title', 'description', 'keywords']
                }
            };

            const response = await this.elasticsearch.search<SeoAnalysis>(
                `${this.INDEX_PREFIX}_analyses`,
                searchQuery
            );

            return response;
        } catch (error) {
            console.error('Erreur lors de la recherche d\'analyses:', error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        await this.rabbitmq.close();
    }
} 