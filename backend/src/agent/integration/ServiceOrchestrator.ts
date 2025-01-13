import { Redis } from 'ioredis';
import { RabbitMQ } from '../utils/RabbitMQ';
import { Config } from '../../config/config';
import { ServiceAction } from '../core/types';

export class ServiceOrchestrator {
    private readonly redis: Redis;
    private readonly rabbitmq: RabbitMQ;
    private readonly serviceQueues: Record<string, string> = {
        'make': 'make_service_queue',
        'boost': 'boost_service_queue',
        'afforai': 'afforai_service_queue'
    };

    constructor(config: Config) {
        this.redis = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
        });

        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            
            // Créer les files d'attente pour chaque service
            for (const queue of Object.values(this.serviceQueues)) {
                await this.rabbitmq.createQueue(queue);
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'orchestrateur:', error);
            throw error;
        }
    }

    async executeAction(action: ServiceAction): Promise<void> {
        try {
            const queue = this.getQueueForAction(action.type);
            if (!queue) {
                throw new Error(`Service non pris en charge: ${action.type}`);
            }

            await this.rabbitmq.publish(queue, action);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de l\'action:', error);
            throw error;
        }
    }

    private getQueueForAction(actionType: string): string | undefined {
        return this.serviceQueues[actionType.toLowerCase()];
    }

    async cleanup(): Promise<void> {
        try {
            await this.redis.quit();
            // La connexion RabbitMQ sera fermée par le gestionnaire de connexion
        } catch (error) {
            console.error('Erreur lors du nettoyage de l\'orchestrateur:', error);
            throw error;
        }
    }
} 