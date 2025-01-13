import { EventEmitter } from 'events';
import logger from '../services/logger';

export interface SystemEvent {
    type: string;
    payload: any;
    timestamp: Date;
    source: string;
}

class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
        this.setupErrorHandling();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    private setupErrorHandling(): void {
        this.on('error', (error) => {
            logger.error('Erreur dans EventBus:', error);
        });
    }

    emit(event: string, payload: any): boolean {
        const systemEvent: SystemEvent = {
            type: event,
            payload,
            timestamp: new Date(),
            source: 'system'
        };
        logger.info(`Event émis: ${event}`, { payload });
        return super.emit(event, systemEvent);
    }

    subscribe(event: string, handler: (event: SystemEvent) => void): void {
        this.on(event, handler);
        logger.info(`Nouveau subscriber pour: ${event}`);
    }

    unsubscribe(event: string, handler: (event: SystemEvent) => void): void {
        this.off(event, handler);
        logger.info(`Subscriber retiré pour: ${event}`);
    }
}

export const eventBus = EventBus.getInstance(); 