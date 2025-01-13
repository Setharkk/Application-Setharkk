import { ServiceConfig, ServiceMetadata, ServiceType } from '../../types/service';
import logger from '../logger';

export abstract class BaseService {
  protected config: ServiceConfig;
  protected metadata: ServiceMetadata;
  protected status: string = 'initialized';

  constructor(config: ServiceConfig, metadata: ServiceMetadata) {
    this.config = config;
    this.metadata = metadata;
  }

  public getId(): string {
    return this.config.id;
  }

  public getName(): string {
    return this.config.name;
  }

  public getType(): ServiceType {
    return this.config.type;
  }

  public getDependencies(): string[] {
    return this.config.dependencies;
  }

  public getStatus(): string {
    return this.status;
  }

  public async initialize(): Promise<void> {
    try {
      this.status = 'initializing';
      logger.info(`Initializing service ${this.getName()}`);
      await this.doInitialize();
      this.status = 'running';
      logger.info(`Service ${this.getName()} initialized successfully`);
    } catch (error) {
      this.status = 'error';
      logger.error(`Error initializing service ${this.getName()}:`, { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          service: this.getName()
      });
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.status = 'shutting_down';
      logger.info(`Shutting down service ${this.getName()}`);
      await this.doShutdown();
      this.status = 'stopped';
      logger.info(`Service ${this.getName()} shut down successfully`);
    } catch (error) {
      this.status = 'error';
      logger.error(`Error shutting down service ${this.getName()}:`, { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          service: this.getName()
      });
      throw error;
    }
  }

  protected abstract doInitialize(): Promise<void>;
  protected abstract doShutdown(): Promise<void>;
} 