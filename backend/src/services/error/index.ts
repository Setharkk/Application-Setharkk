import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import { ErrorData, ErrorFilter, ErrorStats, ErrorStatus } from '../../types/error';
import logger from '../logger';

export class ErrorService extends BaseService {
    private readonly errors: Map<string, ErrorData>;
    private readonly maxErrors = 1000;

    constructor() {
        super(
            {
                id: 'error-service',
                name: 'Error Service',
                type: ServiceType.INFRASTRUCTURE,
                dependencies: [
                    'monitoring-service',
                    'logger-service'
                ]
            },
            {
                version: '1.0.0',
                description: 'Manages error logging, storage and notifications for the application',
                author: 'DevTeam',
                tags: ['errors', 'monitoring', 'logging']
            }
        );
        this.errors = new Map();
    }

    async logError(errorData: Omit<ErrorData, 'timestamp'>): Promise<ErrorData> {
        try {
            const error: ErrorData = {
                ...errorData,
                timestamp: new Date(),
                status: errorData.status || 'new'
            };

            const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            
            // Gestion de la limite de stockage
            if (this.errors.size >= this.maxErrors) {
                const oldestError = Array.from(this.errors.entries())
                    .sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime())[0];
                if (oldestError) {
                    this.errors.delete(oldestError[0]);
                }
            }

            this.errors.set(errorId, error);
            logger.error(`Nouvelle erreur enregistrée: ${errorId}`, { 
                errorId,
                message: error.message,
                severity: error.severity,
                status: error.status
            });

            // Notification si erreur critique
            if (error.severity === 'high') {
                await this.notifyHighSeverityError(errorId, error);
            }

            return { ...error, id: errorId };
        } catch (error) {
            logger.error('Erreur lors de l\'enregistrement de l\'erreur:', error);
            throw error;
        }
    }

    async getErrors(filter?: ErrorFilter): Promise<ErrorData[]> {
        try {
            let errors = Array.from(this.errors.entries()).map(([id, error]) => ({
                ...error,
                id
            }));

            if (filter) {
                errors = errors.filter(error => {
                    if (filter.severity && error.severity !== filter.severity) return false;
                    if (filter.status && error.status !== filter.status) return false;
                    if (filter.startDate && error.timestamp < filter.startDate) return false;
                    if (filter.endDate && error.timestamp > filter.endDate) return false;
                    return true;
                });
            }

            return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        } catch (error) {
            logger.error('Erreur lors de la récupération des erreurs:', error);
            throw error;
        }
    }

    async getErrorDetails(errorId: string): Promise<ErrorData | null> {
        try {
            const error = this.errors.get(errorId);
            return error ? { ...error, id: errorId } : null;
        } catch (error) {
            logger.error(`Erreur lors de la récupération des détails de l'erreur ${errorId}:`, error);
            throw error;
        }
    }

    async updateErrorStatus(errorId: string, status: ErrorStatus, resolution?: string): Promise<ErrorData> {
        try {
            const error = this.errors.get(errorId);
            if (!error) {
                throw new Error(`Erreur non trouvée: ${errorId}`);
            }

            const updatedError: ErrorData = {
                ...error,
                status,
                resolution,
                updatedAt: new Date()
            };

            this.errors.set(errorId, updatedError);
            logger.info(`Statut de l'erreur ${errorId} mis à jour: ${status}`);

            return { ...updatedError, id: errorId };
        } catch (error) {
            logger.error(`Erreur lors de la mise à jour du statut de l'erreur ${errorId}:`, error);
            throw error;
        }
    }

    async deleteError(errorId: string): Promise<void> {
        try {
            if (!this.errors.has(errorId)) {
                throw new Error(`Erreur non trouvée: ${errorId}`);
            }
            this.errors.delete(errorId);
            logger.info(`Erreur ${errorId} supprimée`);
        } catch (error) {
            logger.error(`Erreur lors de la suppression de l'erreur ${errorId}:`, error);
            throw error;
        }
    }

    async getErrorStats(period: string = '24h'): Promise<ErrorStats> {
        try {
            const now = new Date();
            const startDate = new Date(now.getTime() - this.getPeriodInMs(period));

            const relevantErrors = Array.from(this.errors.values())
                .filter(error => error.timestamp >= startDate);

            const stats: ErrorStats = {
                total: relevantErrors.length,
                bySeverity: {
                    low: 0,
                    medium: 0,
                    high: 0
                },
                byStatus: {
                    new: 0,
                    investigating: 0,
                    resolved: 0,
                    closed: 0
                },
                trend: this.calculateTrend(relevantErrors, period)
            };

            // Calcul des statistiques
            relevantErrors.forEach(error => {
                stats.bySeverity[error.severity]++;
                stats.byStatus[error.status]++;
            });

            return stats;
        } catch (error) {
            logger.error('Erreur lors du calcul des statistiques:', error);
            throw error;
        }
    }

    private getPeriodInMs(period: string): number {
        const periods: Record<string, number> = {
            '1h': 3600000,
            '24h': 86400000,
            '7d': 604800000,
            '30d': 2592000000
        };
        return periods[period] || periods['24h'];
    }

    private calculateTrend(errors: ErrorData[], period: string): { date: Date; count: number }[] {
        const intervals = period === '1h' ? 12 : 24; // 5min intervals for 1h, 1h intervals for others
        const intervalMs = this.getPeriodInMs(period) / intervals;
        const now = new Date();
        const trend: { date: Date; count: number }[] = [];

        for (let i = intervals - 1; i >= 0; i--) {
            const intervalEnd = new Date(now.getTime() - i * intervalMs);
            const intervalStart = new Date(intervalEnd.getTime() - intervalMs);
            
            const count = errors.filter(error => 
                error.timestamp >= intervalStart && error.timestamp < intervalEnd
            ).length;

            trend.push({ date: intervalStart, count });
        }

        return trend;
    }

    private async notifyHighSeverityError(errorId: string, error: ErrorData): Promise<void> {
        try {
            // Envoi de la notification
            const notificationMessage = {
                title: 'Erreur Critique Détectée',
                message: `ID: ${errorId}\nMessage: ${error.message}\nSeverity: ${error.severity}`,
                timestamp: new Date().toISOString()
            };
            
            // Simulation d'envoi de notification
            await this.sendNotification(notificationMessage);
            logger.warn(`Erreur critique détectée: ${errorId}`, { ...notificationMessage });
        } catch (notifyError) {
            logger.error('Erreur lors de la notification:', notifyError);
        }
    }

    private async sendNotification(notification: { title: string; message: string; timestamp: string }): Promise<void> {
        // Simulation d'envoi de notification
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Notification envoyée:', notification);
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Service de gestion des erreurs initialisé');
    }

    protected async doShutdown(): Promise<void> {
        this.errors.clear();
        logger.info('Service de gestion des erreurs arrêté');
    }
}

export const errorService = new ErrorService(); 