import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';

export class MemoryService extends BaseService {
  private readonly memoryMap: Map<string, string | number | boolean | object>;

  constructor() {
    super(
      {
        id: 'memory',
        name: 'Memory Service',
        type: ServiceType.CORE,
        dependencies: []
      },
      {
        version: '1.0.0',
        description: 'Service de gestion de la mémoire',
        author: 'Setharkk',
        tags: ['memory', 'storage', 'cache']
      }
    );
    this.memoryMap = new Map();
  }

  protected async doInitialize(): Promise<void> {
    logger.info('Initializing memory service');
    // Initialization logic here
  }

  protected async doShutdown(): Promise<void> {
    logger.info('Shutting down memory service');
    this.memoryMap.clear();
  }

  // Public methods for memory management
  public set(key: string, value: string | number | boolean | object): void {
    this.memoryMap.set(key, value);
  }

  public get(key: string): string | number | boolean | object | undefined {
    return this.memoryMap.get(key);
  }

  public has(key: string): boolean {
    return this.memoryMap.has(key);
  }

  public delete(key: string): boolean {
    return this.memoryMap.delete(key);
  }

  public clear(): void {
    this.memoryMap.clear();
  }

  public getKeys(): string[] {
    return Array.from(this.memoryMap.keys());
  }

  public getSize(): number {
    return this.memoryMap.size;
  }

  public async update(data: Record<string, unknown>): Promise<boolean> {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'object') {
          this.set(key, value);
        }
      }
      return true;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la mémoire:', error);
      return false;
    }
  }

  public async getContext(sessionId: string): Promise<Record<string, unknown>> {
    const contextKey = `context:${sessionId}`;
    return (this.get(contextKey) as Record<string, unknown>) ?? {};
  }

  public async getState(): Promise<Record<string, unknown>> {
    return {
      size: this.getSize(),
      keys: this.getKeys(),
      lastUpdated: new Date().toISOString()
    };
  }

  public async learnPattern(pattern: Record<string, unknown>): Promise<void> {
    const patterns = (this.get('patterns') as Record<string, unknown>[]) ?? [];
    patterns.push({ ...pattern, timestamp: new Date().toISOString() });
    this.set('patterns', patterns);
  }
}

export const memoryService = new MemoryService();