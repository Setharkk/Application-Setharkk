import { ElasticsearchConfig } from '../database/ElasticsearchService';
import { LinkedInService } from './LinkedInService';
import type { LinkedInProfile } from './LinkedInService';

export interface ProspectionServiceConfig {
    linkedin: {
        apiKey: string;
        baseUrl: string;
        elasticsearch: ElasticsearchConfig;
        rabbitmq: {
            url: string;
        };
    };
}

export class ProspectionService {
    private readonly linkedin: LinkedInService;

    constructor(config: ProspectionServiceConfig) {
        this.linkedin = new LinkedInService(config.linkedin);
    }

    async initialize(): Promise<void> {
        await this.linkedin.initialize();
    }

    async searchProfiles(query: Record<string, unknown>): Promise<LinkedInProfile[]> {
        return this.linkedin.searchProfiles(query);
    }

    async getProfile(id: string): Promise<LinkedInProfile> {
        return this.linkedin.getProfile(id);
    }

    async cleanup(): Promise<void> {
        await this.linkedin.cleanup();
    }
} 