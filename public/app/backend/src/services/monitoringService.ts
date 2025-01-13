import { eventBus } from '../events/eventBus';
import logger from './logger';

interface Metric {
    name: string;
    value: number;
    timestamp: Date;
    tags: Record<string, string>;
}

interface PerformanceMetric {
    operation: string;
    duration: number;
    success: boolean;
    metadata?: Record<string, any>;
}

class MonitoringService {
    private metrics: Metric[] = [];
    private readonly maxMetrics = 1000;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        eventBus.subscribe('error', (event) => {
            this.trackError(event.payload);
        });

        eventBus.subscribe('performance', (event) => {
            this.trackPerformance(event.payload);
        });
    }

    trackMetric(name: string, value: number, tags: Record<string, string> = {}): void {
        const metric: Metric = {
            name,
            value,
            timestamp: new Date(),
            tags
        };

        this.metrics.push(metric);
        this.pruneMetrics();
        
        logger.debug('Métrique enregistrée:', metric);
    }

    trackError(error: Error & { code?: string; metadata?: Record<string, any> }): void {
        this.trackMetric('error', 1, {
            type: error.name,
            code: error.code || 'unknown',
            message: error.message
        });
    }

    trackPerformance(data: PerformanceMetric): void {
        this.trackMetric(`performance.${data.operation}`, data.duration, {
            success: String(data.success),
            ...data.metadata
        });
    }

    async measureOperation<T>(
        name: string,
        operation: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        const start = process.hrtime();
        
        try {
            const result = await operation();
            const [seconds, nanoseconds] = process.hrtime(start);
            const duration = seconds * 1000 + nanoseconds / 1e6;

            this.trackPerformance({
                operation: name,
                duration,
                success: true,
                metadata
            });

            return result;
        } catch (error) {
            const [seconds, nanoseconds] = process.hrtime(start);
            const duration = seconds * 1000 + nanoseconds / 1e6;

            this.trackPerformance({
                operation: name,
                duration,
                success: false,
                metadata: { ...metadata, error: error.message }
            });

            throw error;
        }
    }

    getMetrics(filter?: { name?: string; tags?: Record<string, string> }): Metric[] {
        return this.metrics.filter(metric => {
            if (filter?.name && metric.name !== filter.name) {
                return false;
            }

            if (filter?.tags) {
                return Object.entries(filter.tags).every(
                    ([key, value]) => metric.tags[key] === value
                );
            }

            return true;
        });
    }

    private pruneMetrics(): void {
        if (this.metrics.length > this.maxMetrics) {
            this.metrics = this.metrics.slice(-this.maxMetrics);
        }
    }

    getStats(): Record<string, any> {
        const now = Date.now();
        const lastMinute = now - 60000;
        const lastHour = now - 3600000;

        return {
            total: this.metrics.length,
            lastMinute: this.metrics.filter(m => m.timestamp.getTime() > lastMinute).length,
            lastHour: this.metrics.filter(m => m.timestamp.getTime() > lastHour).length,
            errorRate: this.calculateErrorRate(),
            performance: this.calculateAveragePerformance()
        };
    }

    private calculateErrorRate(): number {
        const errors = this.metrics.filter(m => m.name === 'error').length;
        return errors / this.metrics.length || 0;
    }

    private calculateAveragePerformance(): Record<string, number> {
        const perfMetrics = this.metrics.filter(m => m.name.startsWith('performance.'));
        const operations = new Map<string, number[]>();

        perfMetrics.forEach(metric => {
            const op = metric.name.split('.')[1];
            if (!operations.has(op)) {
                operations.set(op, []);
            }
            operations.get(op)?.push(metric.value);
        });

        const result: Record<string, number> = {};
        operations.forEach((values, op) => {
            result[op] = values.reduce((a, b) => a + b, 0) / values.length;
        });

        return result;
    }
}

export const monitoringService = new MonitoringService(); 