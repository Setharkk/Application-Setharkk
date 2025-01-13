import logger from '../../utils/logger';
import { BaseService } from './BaseService';
import { ServiceConfig, ServiceMetadata } from '../../types/service';

export abstract class AbstractBaseService extends BaseService {
  constructor(config: ServiceConfig, metadata: ServiceMetadata) {
    super(config, metadata);
  }

  protected async doInitialize(): Promise<void> {
    try {
      await this.onInitialize();
      logger.info(`Service ${this.getName()} initialized successfully`);
    } catch (error) {
      logger.error(`Error during initialization of service ${this.getName()}:`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          service: this.getName()
      });
      throw error;
    }
  }

  protected async doShutdown(): Promise<void> {
    try {
      await this.onShutdown();
      logger.info(`Service ${this.getName()} shut down successfully`);
    } catch (error) {
      logger.error(`Error during shutdown of service ${this.getName()}:`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          service: this.getName()
      });
      throw error;
    }
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onShutdown(): Promise<void>;
} 