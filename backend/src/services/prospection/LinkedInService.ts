import { HttpClient } from '../../utils/HttpClient';
import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';
import { RabbitMQ } from '../../utils/RabbitMQ';

export interface LinkedInConfig {
    apiKey: string;
    baseUrl: string;
    elasticsearch: ElasticsearchConfig;
    rabbitmq: {
        url: string;
    };
}

export interface LinkedInProfile extends Record<string, unknown> {
    id: string;
    name: string;
    headline: string;
    company: string;
    location: string;
    connections: number;
    timestamp: string;
}

export class LinkedInService {
    private readonly http: HttpClient;
    private readonly elasticsearch: ElasticsearchService;
    private readonly rabbitmq: RabbitMQ;
    private readonly INDEX_PREFIX = 'linkedin';

    constructor(config: LinkedInConfig) {
        this.http = new HttpClient(config.baseUrl, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
    }

    async initialize(): Promise<void> {
        await this.createIndices();
        await this.setupQueues();
    }

    private async createIndices(): Promise<void> {
        await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_profiles`, {
            mappings: {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    headline: { type: 'text' },
                    company: { type: 'keyword' },
                    location: { type: 'keyword' },
                    connections: { type: 'integer' },
                    timestamp: { type: 'date' }
                }
            }
        });
    }

    private async setupQueues(): Promise<void> {
        await this.rabbitmq.createQueue(`${this.INDEX_PREFIX}_events`);
        await this.rabbitmq.createQueue(`${this.INDEX_PREFIX}_tasks`);
    }

    async searchProfiles(query: Record<string, unknown>): Promise<LinkedInProfile[]> {
        return this.elasticsearch.search<LinkedInProfile>(`${this.INDEX_PREFIX}_profiles`, query);
    }

    async getProfile(id: string): Promise<LinkedInProfile> {
        const response = await this.http.get<LinkedInProfile>(`/v2/people/${id}`);
        await this.elasticsearch.index(
            `${this.INDEX_PREFIX}_profiles`,
            id,
            response as Record<string, unknown>
        );
        return response;
    }

    async cleanup(): Promise<void> {
        await this.rabbitmq.close();
    }
} 