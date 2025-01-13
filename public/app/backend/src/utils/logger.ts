export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    info(message: string, meta?: Record<string, any>): void {
        console.log(`[${this.context}] INFO: ${message}`, meta || '');
    }

    error(message: string, error?: Error): void {
        console.error(`[${this.context}] ERROR: ${message}`, error || '');
    }

    warn(message: string, meta?: Record<string, any>): void {
        console.warn(`[${this.context}] WARN: ${message}`, meta || '');
    }

    debug(message: string, meta?: Record<string, any>): void {
        console.debug(`[${this.context}] DEBUG: ${message}`, meta || '');
    }
}

export const logger = new Logger('App'); 