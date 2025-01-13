import { Connection, Channel } from 'amqplib';
import { Redis } from 'ioredis';

interface IOrchestrator {
    initialize(): Promise<void>;
    registerService(service: IService): Promise<void>;
    removeService(serviceId: string): Promise<void>;
    getServiceStatus(serviceId: string): Promise<ServiceStatus>;
}

interface IService {
    id: string;
    name: string;
    type: ServiceType;
    status: ServiceStatus;
    dependencies: string[];
    initialize(): Promise<void>;
    terminate(): Promise<void>;
}

enum ServiceType {
    CHAT = 'CHAT',
    MEMORY = 'MEMORY',
    MODULE = 'MODULE',
    EXTENSION = 'EXTENSION'
}

enum ServiceStatus {
    INITIALIZING = 'INITIALIZING',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED',
    ERROR = 'ERROR'
}

class Orchestrator implements IOrchestrator {
    private services: Map<string, IService>;
    private messageQueue: Channel;
    private cache: Redis;

    constructor(messageQueue: Channel, cache: Redis) {
        this.services = new Map();
        this.messageQueue = messageQueue;
        this.cache = cache;
    }

    async initialize(): Promise<void> {
        // Initialisation des connexions
        await this.setupMessageQueue();
        await this.setupCache();
        
        // Restauration de l'état précédent si existant
        await this.restoreState();
    }

    async registerService(service: IService): Promise<void> {
        // Vérification des dépendances
        await this.checkDependencies(service);
        
        // Enregistrement du service
        this.services.set(service.id, service);
        
        // Initialisation du service
        await service.initialize();
        
        // Mise en cache de l'état
        await this.updateState();
    }

    async removeService(serviceId: string): Promise<void> {
        const service = this.services.get(serviceId);
        if (!service) return;

        // Arrêt propre du service
        await service.terminate();
        
        // Suppression du service
        this.services.delete(serviceId);
        
        // Mise à jour du cache
        await this.updateState();
    }

    async getServiceStatus(serviceId: string): Promise<ServiceStatus> {
        const service = this.services.get(serviceId);
        return service ? service.status : ServiceStatus.ERROR;
    }

    private async setupMessageQueue(): Promise<void> {
        // Configuration des échanges et files d'attente
        await this.messageQueue.assertExchange('orchestrator', 'topic', { durable: true });
        await this.messageQueue.assertQueue('service_events', { durable: true });
    }

    private async setupCache(): Promise<void> {
        // Configuration du cache Redis
        await this.cache.config('SET', 'notify-keyspace-events', 'Ex');
    }

    private async checkDependencies(service: IService): Promise<void> {
        for (const depId of service.dependencies) {
            const dep = this.services.get(depId);
            if (!dep || dep.status !== ServiceStatus.RUNNING) {
                throw new Error(`Dépendance non satisfaite: ${depId}`);
            }
        }
    }

    private async restoreState(): Promise<void> {
        const state = await this.cache.get('orchestrator_state');
        if (state) {
            const services = JSON.parse(state);
            for (const [id, service] of Object.entries(services)) {
                await this.registerService(service as IService);
            }
        }
    }

    private async updateState(): Promise<void> {
        const state = Object.fromEntries(this.services);
        await this.cache.set('orchestrator_state', JSON.stringify(state));
    }
}

export {
    IOrchestrator,
    IService,
    ServiceType,
    ServiceStatus,
    Orchestrator
}; 