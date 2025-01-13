import { EventEmitter } from 'events';
import logger from './logger';
import { AppError } from '../errors/appError';

export class ModuleService extends EventEmitter {
    private modules: Map<string, any>;

    constructor() {
        super();
        this.modules = new Map();
    }

    public async listModules(): Promise<string[]> {
        return Array.from(this.modules.keys());
    }

    public async executeAction(moduleId: string, action: string, params: any = {}): Promise<any> {
        const module = this.modules.get(moduleId);
        if (!module) throw new AppError(`Module ${moduleId} non trouvé`);
        return module.execute(action, params);
    }

    public async loadModule(moduleId: string, config: any = {}): Promise<boolean> {
        if (this.modules.has(moduleId)) {
            throw new AppError(`Module ${moduleId} déjà chargé`, 400);
        }
        this.modules.set(moduleId, { ...config, id: moduleId });
        return true;
    }

    public async unloadModule(moduleId: string): Promise<boolean> {
        if (!this.modules.has(moduleId)) {
            throw new AppError(`Module ${moduleId} non trouvé`, 404);
        }
        return this.modules.delete(moduleId);
    }

    async getStatus(moduleId: string) {
        return {
            id: moduleId,
            status: 'running',
            lastUpdate: new Date().toISOString()
        };
    }
}

export const moduleService = new ModuleService();
export default moduleService; 