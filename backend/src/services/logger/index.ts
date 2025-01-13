import { AbstractBaseService } from '../BaseService';
import { ServiceType } from '../../types/service';

type LogMetadata = Record<string, string | number | boolean>;

class Logger extends AbstractBaseService {
    constructor() {
        super(
            {
                id: 'logger-service',
                name: 'Service de Logging',
                type: ServiceType.INFRASTRUCTURE,
                dependencies: []
            },
            {
                version: '1.0.0',
                description: 'Service de journalisation',
                author: 'Setharkk',
                tags: ['logging', 'debug']
            }
        );
    }

    protected async doInitialize(): Promise<void> {
        console.log('Service de logging initialisé');
    }

    protected async doShutdown(): Promise<void> {
        console.log('Service de logging arrêté');
    }

    info(message: string, meta?: LogMetadata): void {
        console.log(`[INFO] ${message}`, meta || '');
    }

    error(message: string, error?: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] ${message}`, errorMessage || '');
    }

    warn(message: string, meta?: LogMetadata): void {
        console.warn(`[WARN] ${message}`, meta || '');
    }

    debug(message: string, meta?: LogMetadata): void {
        console.debug(`[DEBUG] ${message}`, meta || '');
    }
}

const logger = new Logger();
export default logger; 