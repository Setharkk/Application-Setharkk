import { Logger } from '../utils/logger';

interface OperationMetrics {
    duration: number;
    success: boolean;
    timestamp: Date;
    type: string;
    details?: Record<string, any>;
}

export class MetricsService {
    private logger: Logger;
    private metrics: OperationMetrics[];

    constructor() {
        this.logger = new Logger('MetricsService');
        this.metrics = [];
    }

    async measureMLOperation<T>(
        type: string,
        operation: () => Promise<T>,
        details?: Record<string, any>
    ): Promise<T> {
        const startTime = Date.now();
        let success = true;

        try {
            const result = await operation();
            return result;
        } catch (error) {
            success = false;
            throw error;
        } finally {
            const duration = Date.now() - startTime;
            this.metrics.push({
                duration,
                success,
                timestamp: new Date(),
                type,
                details
            });

            this.logger.info(`Opération ${type} terminée en ${duration}ms`);
        }
    }

    getMetrics(
        type?: string,
        startDate?: Date,
        endDate?: Date
    ): OperationMetrics[] {
        let filtered = this.metrics;

        if (type) {
            filtered = filtered.filter(m => m.type === type);
        }

        if (startDate) {
            filtered = filtered.filter(m => m.timestamp >= startDate);
        }

        if (endDate) {
            filtered = filtered.filter(m => m.timestamp <= endDate);
        }

        return filtered;
    }

    getAverageOperationTime(type: string): number {
        const typeMetrics = this.metrics.filter(m => m.type === type);
        if (typeMetrics.length === 0) return 0;

        const totalDuration = typeMetrics.reduce((sum, m) => sum + m.duration, 0);
        return totalDuration / typeMetrics.length;
    }

    getSuccessRate(type: string): number {
        const typeMetrics = this.metrics.filter(m => m.type === type);
        if (typeMetrics.length === 0) return 0;

        const successCount = typeMetrics.filter(m => m.success).length;
        return (successCount / typeMetrics.length) * 100;
    }

    clearMetrics(): void {
        const count = this.metrics.length;
        this.metrics = [];
        this.logger.info(`${count} métriques supprimées`);
    }
}

export const metricsService = new MetricsService(); 