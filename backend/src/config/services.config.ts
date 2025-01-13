import { ServiceType, ServiceConfig, ServiceMetadata } from '../types/service';

interface ServiceDefinition {
    config: ServiceConfig;
    metadata: ServiceMetadata;
}

const servicesConfig: Record<string, ServiceDefinition> = {
    chat: {
        config: {
            id: 'chat-service',
            name: 'Service de Chat',
            type: ServiceType.CHAT,
            dependencies: ['ml-service']
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de gestion des conversations',
            author: 'Setharkk',
            tags: ['chat', 'conversation', 'ml']
        }
    },
    memory: {
        config: {
            id: 'memory-service',
            name: 'Service de Mémoire',
            type: ServiceType.MEMORY,
            dependencies: ['ml-service']
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de gestion de la mémoire',
            author: 'Setharkk',
            tags: ['memory', 'storage', 'ml']
        }
    },
    ml: {
        config: {
            id: 'ml-service',
            name: 'Service ML',
            type: ServiceType.CORE,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de traitement ML',
            author: 'Setharkk',
            tags: ['ml', 'ai', 'core']
        }
    },
    analysis: {
        config: {
            id: 'analysis-service',
            name: 'Service d\'Analyse',
            type: ServiceType.ANALYSIS,
            dependencies: ['ml-service']
        },
        metadata: {
            version: '1.0.0',
            description: 'Service d\'analyse de contenu',
            author: 'Setharkk',
            tags: ['analysis', 'ml']
        }
    },
    monitoring: {
        config: {
            id: 'monitoring-service',
            name: 'Service de Monitoring',
            type: ServiceType.MONITORING,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de surveillance système',
            author: 'Setharkk',
            tags: ['monitoring', 'system']
        }
    },
    metrics: {
        config: {
            id: 'metrics-service',
            name: 'Service de Métriques',
            type: ServiceType.METRICS,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de collecte de métriques',
            author: 'Setharkk',
            tags: ['metrics', 'monitoring']
        }
    },
    error: {
        config: {
            id: 'error-service',
            name: 'Service d\'Erreurs',
            type: ServiceType.ERROR,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de gestion des erreurs',
            author: 'Setharkk',
            tags: ['error', 'logging']
        }
    },
    cache: {
        config: {
            id: 'cache-service',
            name: 'Service de Cache',
            type: ServiceType.CACHE,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de mise en cache',
            author: 'Setharkk',
            tags: ['cache', 'performance']
        }
    },
    system: {
        config: {
            id: 'system-service',
            name: 'Service Système',
            type: ServiceType.SYSTEM,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de gestion système',
            author: 'Setharkk',
            tags: ['system', 'core']
        }
    },
    orchestrator: {
        config: {
            id: 'orchestrator-service',
            name: 'Service d\'Orchestration',
            type: ServiceType.ORCHESTRATOR,
            dependencies: []
        },
        metadata: {
            version: '1.0.0',
            description: 'Service de gestion et d\'orchestration',
            author: 'Setharkk',
            tags: ['orchestration', 'core']
        }
    }
};

export const getServiceConfig = (serviceId: keyof typeof servicesConfig): ServiceDefinition => {
    const config = servicesConfig[serviceId];
    if (!config) {
        throw new Error(`Configuration non trouvée pour le service: ${serviceId}`);
    }
    return config;
}; 