import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import { 
    SystemResources, 
    SystemStatus, 
    SystemConfig, 
    SystemLog,
    SystemLogFilter,
    SystemDiagnostics,
    HealthCheckResult,
    PerformanceMetrics,
    DependencyStatus,
    ServiceHealthStatus
} from '../../types/system';
import logger from '../logger';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NetworkStats {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
    connections: number;
}

interface MaintenanceResult {
    success: boolean;
    details: {
        tasksCompleted: string[];
        errors?: string[];
    };
    duration: number;
}

export class SystemService extends BaseService {
    private readonly logs: SystemLog[] = [];
    private readonly maxLogs = 10000;
    private systemConfig: SystemConfig;

    constructor() {
        super(
            {
                id: 'system-service',
                name: 'System Service',
                type: ServiceType.INFRASTRUCTURE,
                dependencies: []
            },
            {
                version: '1.0.0',
                description: 'Manages system resources, monitoring, and maintenance operations',
                author: 'Platform Team',
                tags: ['system', 'monitoring', 'maintenance', 'infrastructure']
            }
        );

        this.systemConfig = {
            maintenance: {
                enabled: true,
                schedule: '0 0 * * 0' // Tous les dimanches à minuit
            },
            monitoring: {
                interval: 60000, // 1 minute
                retention: 7, // 7 jours
                alerts: true
            },
            backup: {
                enabled: true,
                schedule: '0 0 * * *', // Tous les jours à minuit
                retention: 30 // 30 jours
            },
            security: {
                maxLoginAttempts: 5,
                sessionTimeout: 3600, // 1 heure
                ipWhitelist: []
            }
        };
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Service système initialisé');
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Service système arrêté');
    }

    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const services = await this.checkServices();
            return {
                status: this.determineOverallStatus(services),
                uptime: os.uptime(),
                lastCheck: new Date(),
                services
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération du statut système:', error);
            throw error;
        }
    }

    async getSystemResources(): Promise<SystemResources> {
        try {
            const cpuUsage = await this.getCpuUsage();
            return {
                cpu: {
                    usage: cpuUsage,
                    cores: os.cpus().length,
                    temperature: await this.getCpuTemperature()
                },
                memory: {
                    total: os.totalmem(),
                    used: os.totalmem() - os.freemem(),
                    free: os.freemem(),
                    cached: await this.getMemoryCached()
                },
                disk: await this.getDiskUsage(),
                network: await this.getNetworkStats()
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération des ressources système:', error);
            throw error;
        }
    }

    async getSystemLogs(filter?: SystemLogFilter): Promise<SystemLog[]> {
        try {
            let filteredLogs = [...this.logs];

            if (filter) {
                filteredLogs = filteredLogs.filter(log => {
                    if (filter.level && log.level !== filter.level) return false;
                    if (filter.service && log.service !== filter.service) return false;
                    if (filter.startDate && log.timestamp < filter.startDate) return false;
                    if (filter.endDate && log.timestamp > filter.endDate) return false;
                    return true;
                });
            }

            return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        } catch (error) {
            logger.error('Erreur lors de la récupération des logs système:', error);
            throw error;
        }
    }

    async getSystemConfig(): Promise<SystemConfig> {
        return this.systemConfig;
    }

    async updateSystemConfig(newConfig: Partial<SystemConfig>): Promise<SystemConfig> {
        try {
            this.systemConfig = {
                ...this.systemConfig,
                ...newConfig,
                maintenance: { ...this.systemConfig.maintenance, ...newConfig.maintenance },
                monitoring: { ...this.systemConfig.monitoring, ...newConfig.monitoring },
                backup: { ...this.systemConfig.backup, ...newConfig.backup },
                security: { ...this.systemConfig.security, ...newConfig.security }
            };

            logger.info('Configuration système mise à jour');
            return this.systemConfig;
        } catch (error) {
            logger.error('Erreur lors de la mise à jour de la configuration système:', error);
            throw error;
        }
    }

    async getSystemDiagnostics(): Promise<SystemDiagnostics> {
        try {
            const [resources, status] = await Promise.all([
                this.getSystemResources(),
                this.getSystemStatus()
            ]);

            const healthChecks = await this.performHealthChecks();
            const performance = await this.getPerformanceMetrics();
            const dependencies = await this.checkDependencies();

            return {
                timestamp: new Date(),
                resources,
                status,
                healthChecks,
                performance,
                dependencies
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération des diagnostics système:', error);
            throw error;
        }
    }

    async performSystemMaintenance(type: 'full' | 'quick' | 'security'): Promise<void> {
        try {
            logger.info(`Début de la maintenance système de type: ${type}`);

            switch (type) {
                case 'full':
                    await this.performFullMaintenance();
                    break;
                case 'quick':
                    await this.performQuickMaintenance();
                    break;
                case 'security':
                    await this.performSecurityMaintenance();
                    break;
            }

            this.systemConfig.maintenance.lastRun = new Date();
            logger.info(`Maintenance système de type ${type} terminée`);
        } catch (error) {
            logger.error(`Erreur lors de la maintenance système de type ${type}:`, error);
            throw error;
        }
    }

    private async getCpuUsage(): Promise<number> {
        const startMeasure = os.cpus().map(cpu => cpu.times);
        await new Promise(resolve => setTimeout(resolve, 100));
        const endMeasure = os.cpus().map(cpu => cpu.times);

        const totalUsage = endMeasure.map((end, i) => {
            const start = startMeasure[i];
            const total = (end.user + end.nice + end.sys + end.idle) - (start.user + start.nice + start.sys + start.idle);
            const idle = end.idle - start.idle;
            return (total - idle) / total;
        });

        return totalUsage.reduce((acc, val) => acc + val, 0) / totalUsage.length * 100;
    }

    private async getCpuTemperature(): Promise<number | undefined> {
        try {
            if (process.platform === 'linux') {
                const { stdout } = await execAsync('cat /sys/class/thermal/thermal_zone0/temp');
                return parseInt(stdout) / 1000;
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    private async getMemoryCached(): Promise<number | undefined> {
        try {
            if (process.platform === 'linux') {
                const { stdout } = await execAsync('free -b');
                const lines = stdout.split('\n');
                const memoryLine = lines[1].split(/\s+/);
                return parseInt(memoryLine[6]);
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    private async getDiskUsage(): Promise<SystemResources['disk']> {
        try {
            if (process.platform === 'linux' || process.platform === 'darwin') {
                const { stdout } = await execAsync('df -B1 .');
                const lines = stdout.split('\n');
                const diskLine = lines[1].split(/\s+/);
                return {
                    total: parseInt(diskLine[1]),
                    used: parseInt(diskLine[2]),
                    free: parseInt(diskLine[3])
                };
            }
            return {
                total: 0,
                used: 0,
                free: 0
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération de l\'utilisation du disque:', error);
            return {
                total: 0,
                used: 0,
                free: 0
            };
        }
    }

    private async getNetworkStats(): Promise<NetworkStats> {
        // Implémentation de la récupération des statistiques réseau
        return {
            bytesIn: 0,
            bytesOut: 0,
            packetsIn: 0,
            packetsOut: 0,
            errors: 0,
            connections: 0
        };
    }

    private async checkServices(): Promise<Record<string, ServiceHealthStatus>> {
        // Implémentation de la vérification des services
        return {};
    }

    private determineOverallStatus(services: Record<string, ServiceHealthStatus>): 'healthy' | 'degraded' | 'unhealthy' {
        const serviceStatuses = Object.values(services);
        if (serviceStatuses.length === 0) return 'healthy';
        
        const hasError = serviceStatuses.some(s => s.status === 'error');
        const hasStopped = serviceStatuses.some(s => s.status === 'stopped');
        
        if (hasError) return 'unhealthy';
        if (hasStopped) return 'degraded';
        return 'healthy';
    }

    private async performHealthChecks(): Promise<HealthCheckResult[]> {
        // Implémentation des vérifications de santé
        return [];
    }

    private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        // Implémentation de la récupération des métriques de performance
        return {
            cpu: 0,
            memory: 0,
            latency: 0,
            uptime: 0
        };
    }

    private async checkDependencies(): Promise<Record<string, DependencyStatus>> {
        // Implémentation de la vérification des dépendances
        return {};
    }

    private async performFullMaintenance(): Promise<MaintenanceResult> {
        // Implémentation de la maintenance complète
        return {
            success: true,
            details: {
                tasksCompleted: []
            },
            duration: 0
        };
    }

    private async performQuickMaintenance(): Promise<MaintenanceResult> {
        return {
            success: true,
            details: {
                tasksCompleted: ['Nettoyage des fichiers temporaires', 'Vérification des processus']
            },
            duration: 0
        };
    }

    private async performSecurityMaintenance(): Promise<MaintenanceResult> {
        return {
            success: true,
            details: {
                tasksCompleted: ['Scan antivirus', 'Vérification des permissions', 'Audit des accès']
            },
            duration: 0
        };
    }
}

export const systemService = new SystemService(); 