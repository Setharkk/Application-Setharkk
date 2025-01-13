import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';

interface Metric {
    id: string;
    name: string;
    value: number;
    timestamp: Date;
    tags: string[];
}

export class MetricsService extends BaseService {
    private metrics: Metric[] = [];
    private readonly maxMetrics = 10000;

    constructor() {
        super(
            {
                id: 'metrics',
                name: 'Metrics Service',
                type: ServiceType.INFRASTRUCTURE,
                dependencies: ['monitoring']
            },
            {
                version: '1.0.0',
                description: 'Service de collecte et gestion des métriques',
                author: 'Setharkk',
                tags: ['metrics', 'monitoring', 'performance']
            }
        );
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Initializing Metrics service');
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Shutting down Metrics service');
        this.metrics = [];
    }

    recordMetric(name: string, value: number, tags: string[] = []): void {
        const metric: Metric = {
            id: `metric_${Date.now()}`,
            name,
            value,
            tags,
            timestamp: new Date()
        };

        this.metrics.push(metric);
        this.pruneMetrics();

        logger.debug('Métrique enregistrée:', metric);
    }

    getMetrics(filter?: { name?: string; tags?: Record<string, string>; startDate?: Date; endDate?: Date }): Metric[] {
        return this.metrics.filter(metric => {
            if (filter?.name && metric.name !== filter.name) {
                return false;
            }
            if (filter?.tags) {
                for (const [key, value] of Object.entries(filter.tags)) {
                    if (metric.tags[key as keyof typeof metric.tags] !== value) {
                        return false;
                    }
                }
            }
            if (filter?.startDate && metric.timestamp < filter.startDate) {
                return false;
            }
            if (filter?.endDate && metric.timestamp > filter.endDate) {
                return false;
            }
            return true;
        });
    }

    private pruneMetrics(): void {
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }

    clearMetrics(): void {
        this.metrics = [];
        logger.info('Historique des métriques effacé');
    }
}

export const metricsService = new MetricsService(); 