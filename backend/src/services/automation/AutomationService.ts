import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';
import { RabbitMQ, RabbitMessage } from '../../utils/RabbitMQ';
import { Workflow, AutomationExecution } from '../types';
import { BoostSpaceService, BoostSpaceConfig } from './BoostSpaceService';
import { MakeService, MakeConfig } from './MakeService';

export interface AutomationServiceConfig {
    elasticsearch: ElasticsearchConfig;
    rabbitmq: {
        url: string;
    };
    boostSpace: BoostSpaceConfig;
    make: MakeConfig;
}

export class AutomationService {
    private readonly elasticsearch: ElasticsearchService;
    private readonly rabbitmq: RabbitMQ;
    private readonly boostSpace: BoostSpaceService;
    private readonly make: MakeService;
    private readonly INDEX_PREFIX = 'automation';
    private readonly QUEUE_PREFIX = 'automation';

    constructor(config: AutomationServiceConfig) {
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
        this.boostSpace = new BoostSpaceService(config.boostSpace);
        this.make = new MakeService(config.make);
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            await this.createIndices();
            await this.setupQueues();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service d\'automatisation:', error);
            throw error;
        }
    }

    private async createIndices(): Promise<void> {
        try {
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_workflows`, {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    description: { type: 'text' },
                    type: { type: 'keyword' },
                    provider: { type: 'keyword' },
                    status: { type: 'keyword' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_executions`, {
                properties: {
                    id: { type: 'keyword' },
                    workflowId: { type: 'keyword' },
                    status: { type: 'keyword' },
                    input: { type: 'object' },
                    output: { type: 'object' },
                    error: { type: 'object' },
                    startedAt: { type: 'date' },
                    completedAt: { type: 'date' }
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

    async executeWorkflow(workflowId: string, input: Record<string, unknown>): Promise<AutomationExecution> {
        try {
            const workflow = await this.elasticsearch.get<Workflow>(
                `${this.INDEX_PREFIX}_workflows`,
                workflowId
            );

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            let execution: AutomationExecution;
            if (workflow.provider === 'boostspace') {
                execution = await this.boostSpace.executeWorkflow(workflowId, input);
            } else if (workflow.provider === 'make') {
                execution = await this.make.executeWorkflow(workflowId, input);
            } else {
                throw new Error('Invalid workflow provider');
            }

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_executions`,
                execution.id,
                execution as unknown as Record<string, unknown>
            );

            const message: RabbitMessage = {
                type: 'workflow_executed',
                data: execution as unknown as Record<string, unknown>,
                timestamp: new Date()
            };

            await this.rabbitmq.publish(`${this.QUEUE_PREFIX}_events`, message);

            return execution;
        } catch (error) {
            console.error('Erreur lors de l\'exécution du workflow:', error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        try {
            await this.rabbitmq.close();
        } catch (error) {
            console.error('Erreur lors du nettoyage du service d\'automatisation:', error);
            throw error;
        }
    }
} 