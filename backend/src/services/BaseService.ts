import { ServiceType, ServiceStatus, ServiceConfig, ServiceHealth, ServiceMetadata } from '../types/service';
import logger from './logger';

export interface BaseService {
    readonly id: string;
    readonly name: string;
    readonly type: ServiceType;
    getStatus(): ServiceHealth;
    getMetadata(): ServiceMetadata;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
}

export abstract class AbstractBaseService implements BaseService {
    readonly id: string;
    readonly name: string;
    readonly type: ServiceType;
    protected config: ServiceConfig;
    protected status: ServiceHealth;
    protected metadata: ServiceMetadata;

    constructor(config: ServiceConfig, metadata: ServiceMetadata) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.config = config;
        this.metadata = metadata;
        this.status = {
            status: ServiceStatus.INITIALIZING,
            lastCheck: new Date()
        };
    }

    getStatus(): ServiceHealth {
        return this.status;
    }

    getMetadata(): ServiceMetadata {
        return this.metadata;
    }

    async initialize(): Promise<void> {
        try {
            logger.info(`Initialisation du service ${this.name}`);
            await this.doInitialize();
            this.status = {
                status: ServiceStatus.RUNNING,
                lastCheck: new Date()
            };
            logger.info(`Service ${this.name} initialisé avec succès`);
        } catch (error) {
            this.status = {
                status: ServiceStatus.ERROR,
                lastCheck: new Date(),
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
            logger.error(`Erreur lors de l'initialisation du service ${this.name}:`, error);
            throw error;
        }
    }

    async shutdown(): Promise<void> {
        try {
            logger.info(`Arrêt du service ${this.name}`);
            await this.doShutdown();
            this.status = {
                status: ServiceStatus.STOPPED,
                lastCheck: new Date()
            };
            logger.info(`Service ${this.name} arrêté avec succès`);
        } catch (error) {
            this.status = {
                status: ServiceStatus.ERROR,
                lastCheck: new Date(),
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
            logger.error(`Erreur lors de l'arrêt du service ${this.name}:`, error);
            throw error;
        }
    }

    protected abstract doInitialize(): Promise<void>;
    protected abstract doShutdown(): Promise<void>;
} 