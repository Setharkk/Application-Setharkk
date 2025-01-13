import { RabbitMQ } from '../../utils/RabbitMQ';
import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';

export interface CRMConfig {
    elasticsearch: ElasticsearchConfig;
    rabbitmq: {
        url: string;
    };
}

export class CRMService {
    private elasticsearch: ElasticsearchService;
    private rabbitmq: RabbitMQ;
    private readonly INDEX_PREFIX = 'crm';
    private readonly QUEUE_PREFIX = 'crm';

    constructor(config: CRMConfig) {
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            await this.createIndices();
            await this.setupQueues();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service CRM:', error);
            throw error;
        }
    }

    private async createIndices(): Promise<void> {
        try {
            // Index des contacts
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_contacts`, {
                properties: {
                    id: { type: 'keyword' },
                    firstName: { type: 'text' },
                    lastName: { type: 'text' },
                    email: { type: 'keyword' },
                    phone: { type: 'keyword' },
                    company: { type: 'text' },
                    position: { type: 'text' },
                    source: { type: 'keyword' },
                    status: { type: 'keyword' },
                    tags: { type: 'keyword' },
                    notes: { type: 'text' },
                    lastContact: { type: 'date' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des entreprises
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_companies`, {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    industry: { type: 'keyword' },
                    size: { type: 'keyword' },
                    revenue: { type: 'keyword' },
                    website: { type: 'keyword' },
                    address: { type: 'text' },
                    phone: { type: 'keyword' },
                    status: { type: 'keyword' },
                    tags: { type: 'keyword' },
                    notes: { type: 'text' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des opportunités
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_opportunities`, {
                properties: {
                    id: { type: 'keyword' },
                    title: { type: 'text' },
                    description: { type: 'text' },
                    value: { type: 'float' },
                    stage: { type: 'keyword' },
                    probability: { type: 'integer' },
                    expectedCloseDate: { type: 'date' },
                    contactId: { type: 'keyword' },
                    companyId: { type: 'keyword' },
                    tags: { type: 'keyword' },
                    notes: { type: 'text' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des activités
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_activities`, {
                properties: {
                    id: { type: 'keyword' },
                    type: { type: 'keyword' },
                    subject: { type: 'text' },
                    description: { type: 'text' },
                    status: { type: 'keyword' },
                    dueDate: { type: 'date' },
                    contactId: { type: 'keyword' },
                    companyId: { type: 'keyword' },
                    opportunityId: { type: 'keyword' },
                    assignedTo: { type: 'keyword' },
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
        } catch (error) {
            console.error('Erreur lors du nettoyage du service CRM:', error);
            throw error;
        }
    }
} 