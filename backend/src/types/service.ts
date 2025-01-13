export enum ServiceType {
    CORE = 'core',
    INFRASTRUCTURE = 'infrastructure',
    BUSINESS = 'business',
    CHAT = 'chat',
    MEMORY = 'memory',
    ANALYSIS = 'analysis',
    MONITORING = 'monitoring',
    METRICS = 'metrics',
    ERROR = 'error',
    CACHE = 'cache',
    SYSTEM = 'system',
    ORCHESTRATOR = 'orchestrator'
}

export interface ServiceConfig {
    id: string;
    name: string;
    type: ServiceType;
    dependencies: string[];
}

export interface ServiceMetadata {
    version: string;
    description: string;
    author: string;
    tags: string[];
}

export enum ServiceStatus {
    STOPPED = 'stopped',
    INITIALIZING = 'initializing',
    RUNNING = 'running',
    STOPPING = 'stopping',
    ERROR = 'error'
}

export interface ServiceHealth {
    status: ServiceStatus;
    lastCheck: Date;
    error?: string;
} 