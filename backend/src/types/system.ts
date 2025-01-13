export interface SystemResources {
    cpu: {
        usage: number;
        cores: number;
        temperature?: number;
    };
    memory: {
        total: number;
        used: number;
        free: number;
        cached?: number;
    };
    disk: {
        total: number;
        used: number;
        free: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        connections: number;
    };
}

export interface SystemStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    lastCheck: Date;
    services: Record<string, ServiceHealthStatus>;
}

export interface SystemConfig {
    maintenance: {
        enabled: boolean;
        schedule: string;
        lastRun?: Date;
    };
    monitoring: {
        interval: number;
        retention: number;
        alerts: boolean;
    };
    backup: {
        enabled: boolean;
        schedule: string;
        retention: number;
        lastBackup?: Date;
    };
    security: {
        maxLoginAttempts: number;
        sessionTimeout: number;
        ipWhitelist: string[];
    };
}

export interface SystemLog {
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    service: string;
    message: string;
    metadata?: Record<string, string | number | boolean | null>;
}

export interface SystemLogFilter {
    level?: SystemLog['level'];
    service?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface HealthCheckResult {
    service: string;
    status: 'healthy' | 'unhealthy';
    timestamp: Date;
    details?: string;
}

export interface SystemDiagnostics {
    timestamp: Date;
    resources: SystemResources;
    status: SystemStatus;
    healthChecks: HealthCheckResult[];
    performance: PerformanceMetrics;
    dependencies: Record<string, DependencyStatus>;
}

export interface PerformanceMetrics {
    cpu: number;
    memory: number;
    latency: number;
    uptime: number;
}

export interface DependencyStatus {
    available: boolean;
    latency?: number;
    lastCheck: Date;
    error?: string;
}

export interface ServiceHealthStatus {
    status: 'running' | 'stopped' | 'error';
    lastUpdate: Date;
    error?: string;
} 