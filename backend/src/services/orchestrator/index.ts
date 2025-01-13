import { AbstractBaseService, BaseService } from '../BaseService';
import { ServiceType, ServiceConfig, ServiceMetadata, ServiceStatus, ServiceHealth } from '../../types/service';
import logger from '../logger';

const defaultConfig: ServiceConfig = {
    id: 'orchestrator-service',
    name: 'Service d\'Orchestration',
    type: ServiceType.CORE,
    dependencies: []
};

const defaultMetadata: ServiceMetadata = {
    version: '1.0.0',
    description: 'Service de gestion et d\'orchestration des services',
    author: 'Setharkk',
    tags: ['orchestration', 'core']
};

export class OrchestratorService extends AbstractBaseService {
    private readonly services: Map<string, BaseService> = new Map();
    private healthCheckInterval?: NodeJS.Timeout;

    constructor(
        config: ServiceConfig = defaultConfig,
        metadata: ServiceMetadata = defaultMetadata
    ) {
        super(config, metadata);
    }

    protected async doInitialize(): Promise<void> {
        this.startHealthCheck();
    }

    protected async doShutdown(): Promise<void> {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        // Arrêter tous les services dans l'ordre inverse de leur enregistrement
        const services = Array.from(this.services.entries()).reverse();
        for (const [name, service] of services) {
            try {
                await service.shutdown();
                logger.info(`Service ${name} arrêté`);
            } catch (error) {
                logger.error(`Erreur lors de l'arrêt du service ${name}:`, error);
            }
        }
    }

    registerService(service: BaseService): void {
        if (this.services.has(service.id)) {
            throw new Error(`Un service avec l'ID ${service.id} existe déjà`);
        }

        this.services.set(service.id, service);
        logger.info(`Service enregistré: ${service.name} (${service.id})`);
    }

    async startService(serviceId: string): Promise<void> {
        const service = this.services.get(serviceId);
        if (!service) {
            throw new Error(`Service non trouvé: ${serviceId}`);
        }

        await service.initialize();
        logger.info(`Service ${service.name} démarré`);
    }

    async stopService(serviceId: string): Promise<void> {
        const service = this.services.get(serviceId);
        if (!service) {
            throw new Error(`Service non trouvé: ${serviceId}`);
        }

        await service.shutdown();
        logger.info(`Service ${service.name} arrêté`);
    }

    getService(serviceId: string): BaseService | undefined {
        return this.services.get(serviceId);
    }

    getAllServices(): Map<string, BaseService> {
        return new Map(this.services);
    }

    getServiceHealth(serviceId: string): ServiceHealth | undefined {
        const service = this.services.get(serviceId);
        return service?.getStatus();
    }

    getAllServicesHealth(): Map<string, ServiceHealth> {
        const health = new Map<string, ServiceHealth>();
        for (const [id, service] of this.services) {
            health.set(id, service.getStatus());
        }
        return health;
    }

    private startHealthCheck(): void {
        this.healthCheckInterval = setInterval(() => {
            for (const [, service] of this.services) {
                const health = service.getStatus();
                if (health.status === ServiceStatus.ERROR) {
                    logger.error(`Service ${service.name} en erreur:`, health.error);
                }
            }
        }, 30000); // Vérification toutes les 30 secondes
    }
}

export const orchestratorService = new OrchestratorService(); 