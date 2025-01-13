export const OrchestratorConfig = {
    messageQueue: {
        host: process.env.RABBITMQ_HOST || 'localhost',
        port: parseInt(process.env.RABBITMQ_PORT || '5672'),
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASS || 'guest',
        vhost: process.env.RABBITMQ_VHOST || '/',
        exchanges: {
            main: 'orchestrator',
            events: 'service_events'
        },
        queues: {
            services: 'service_events',
            commands: 'service_commands'
        }
    },
    
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: 'orchestrator:',
        keys: {
            state: 'state',
            services: 'services',
            events: 'events'
        }
    },

    services: {
        retryAttempts: 3,
        retryDelay: 1000,
        healthCheckInterval: 30000,
        stateUpdateInterval: 5000
    }
}; 