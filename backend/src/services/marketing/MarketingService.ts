import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';
import { OpenAIService } from '../ai/OpenAIService';
import { EmailService, EmailConfig } from './EmailService';
import { RabbitMQ } from '../../utils/RabbitMQ';

export interface MarketingServiceConfig {
    elasticsearch: ElasticsearchConfig;
    openai: {
        apiKey: string;
    };
    email: EmailConfig;
    rabbitmq: {
        url: string;
    };
}

export class MarketingService {
    private readonly elasticsearch: ElasticsearchService;
    private readonly openai: OpenAIService;
    private readonly email: EmailService;
    private readonly rabbitmq: RabbitMQ;
    private readonly INDEX_PREFIX = 'marketing';
    private readonly QUEUE_PREFIX = 'marketing';

    constructor(config: MarketingServiceConfig) {
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.openai = new OpenAIService(config.openai.apiKey);
        this.email = new EmailService(config.email);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            await this.createIndices();
            await this.setupQueues();
            await this.email.initialize();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service Marketing:', error);
            throw error;
        }
    }

    private async createIndices(): Promise<void> {
        try {
            // Index des campagnes
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_campaigns`, {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    type: { type: 'keyword' },
                    status: { type: 'keyword' },
                    startDate: { type: 'date' },
                    endDate: { type: 'date' },
                    budget: { type: 'float' },
                    metrics: {
                        properties: {
                            impressions: { type: 'integer' },
                            clicks: { type: 'integer' },
                            conversions: { type: 'integer' },
                            cost: { type: 'float' }
                        }
                    },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des audiences
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_audiences`, {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    criteria: { type: 'object' },
                    size: { type: 'integer' },
                    lastUpdated: { type: 'date' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index du contenu
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_content`, {
                properties: {
                    id: { type: 'keyword' },
                    type: { type: 'keyword' },
                    title: { type: 'text' },
                    content: { type: 'text' },
                    keywords: { type: 'keyword' },
                    status: { type: 'keyword' },
                    metrics: {
                        properties: {
                            views: { type: 'integer' },
                            shares: { type: 'integer' },
                            likes: { type: 'integer' },
                            comments: { type: 'integer' }
                        }
                    },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
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

    async cleanup(): Promise<void> {
        try {
            await this.rabbitmq.close();
            await this.email.cleanup();
        } catch (error) {
            console.error('Erreur lors du nettoyage du service Marketing:', error);
            throw error;
        }
    }

    async generateEmailContent(template: string, variables: Record<string, string>): Promise<string> {
        const prompt = `Generate an email using this template: ${template}\nWith these variables: ${JSON.stringify(variables)}`;
        return this.openai.generateText(prompt);
    }
} 