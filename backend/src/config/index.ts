import dotenv from 'dotenv';

dotenv.config();

interface Config {
    app: {
        port: number;
        env: string;
        apiPrefix: string;
    };
    database: {
        mongodb: {
            uri: string;
            options: {
                serverSelectionTimeoutMS: number;
                maxPoolSize: number;
            };
        };
        redis: {
            url: string;
            ttl: number;
        };
        elasticsearch: {
            url: string;
            options: {
                node: string;
            };
        };
    };
    queue: {
        rabbitmq: {
            url: string;
            options: {
                heartbeat: number;
            };
        };
    };
    services: {
        openai: {
            apiKey: string;
            model: string;
            maxTokens: number;
        };
        afforai: {
            apiKey: string;
            workspaceId: string;
            baseUrl: string;
        };
        boostSpace: {
            apiToken: string;
            workspaceId: string;
            projectId: string;
            baseUrl: string;
        };
        seo: {
            enabled: boolean;
            maxConcurrentAnalyses: number;
            scraperPoolSize: number;
            updateInterval: number;
            storage: {
                dataPath: string;
                backupInterval: number;
            };
        };
        marketing: {
            enabled: boolean;
            emailService: {
                host: string;
                port: number;
                secure: boolean;
                auth: {
                    user: string;
                    pass: string;
                };
            };
            analytics: {
                trackingEnabled: boolean;
                retentionDays: number;
            };
            automation: {
                maxConcurrentTasks: number;
                retryAttempts: number;
            };
        };
        prospection: {
            enabled: boolean;
            sources: {
                linkedin: {
                    enabled: boolean;
                    apiKey: string;
                    maxRequestsPerDay: number;
                };
                crm: {
                    enabled: boolean;
                    apiKey: string;
                    provider: string;
                };
            };
            automation: {
                maxLeadsPerDay: number;
                followUpDelay: number;
            };
        };
        automation: {
            make: {
                enabled: boolean;
                apiKey: string;
                webhookUrl: string;
            };
            zapier: {
                enabled: boolean;
                webhookUrl: string;
            };
            n8n: {
                enabled: boolean;
                webhookUrl: string;
                auth: {
                    user: string;
                    password: string;
                };
            };
        };
    };
    monitoring: {
        enabled: boolean;
        metricsInterval: number;
    };
}

export const config: Config = {
    app: {
        port: parseInt(process.env.PORT ?? '3000', 10),
        env: process.env.NODE_ENV ?? 'development',
        apiPrefix: '/api/v1'
    },
    database: {
        mongodb: {
            uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/setharkk',
            options: {
                serverSelectionTimeoutMS: 5000,
                maxPoolSize: 10
            }
        },
        redis: {
            url: process.env.REDIS_URL ?? 'redis://localhost:6379',
            ttl: 3600
        },
        elasticsearch: {
            url: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
            options: {
                node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200'
            }
        }
    },
    queue: {
        rabbitmq: {
            url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
            options: {
                heartbeat: 60
            }
        }
    },
    services: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY ?? '',
            model: 'gpt-3.5-turbo',
            maxTokens: 150
        },
        afforai: {
            apiKey: process.env.AFFORAI_API_KEY ?? '',
            workspaceId: process.env.AFFORAI_WORKSPACE_ID ?? '',
            baseUrl: 'https://api.afforai.com/v1'
        },
        boostSpace: {
            apiToken: process.env.BOOST_SPACE_API_TOKEN ?? '',
            workspaceId: process.env.BOOST_SPACE_WORKSPACE_ID ?? '',
            projectId: process.env.BOOST_SPACE_PROJECT_ID ?? '',
            baseUrl: 'https://api.boost.space/v1'
        },
        seo: {
            enabled: true,
            maxConcurrentAnalyses: 10,
            scraperPoolSize: 5,
            updateInterval: 3600,
            storage: {
                dataPath: './data/seo',
                backupInterval: 86400
            }
        },
        marketing: {
            enabled: true,
            emailService: {
                host: process.env.SMTP_HOST ?? '',
                port: parseInt(process.env.SMTP_PORT ?? '587', 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER ?? '',
                    pass: process.env.SMTP_PASS ?? ''
                }
            },
            analytics: {
                trackingEnabled: true,
                retentionDays: 90
            },
            automation: {
                maxConcurrentTasks: 5,
                retryAttempts: 3
            }
        },
        prospection: {
            enabled: true,
            sources: {
                linkedin: {
                    enabled: true,
                    apiKey: process.env.LINKEDIN_API_KEY ?? '',
                    maxRequestsPerDay: 100
                },
                crm: {
                    enabled: true,
                    apiKey: process.env.CRM_API_KEY ?? '',
                    provider: 'hubspot'
                }
            },
            automation: {
                maxLeadsPerDay: 50,
                followUpDelay: 86400
            }
        },
        automation: {
            make: {
                enabled: true,
                apiKey: process.env.MAKE_API_KEY ?? '',
                webhookUrl: process.env.MAKE_WEBHOOK_URL ?? ''
            },
            zapier: {
                enabled: true,
                webhookUrl: process.env.ZAPIER_WEBHOOK_URL ?? ''
            },
            n8n: {
                enabled: true,
                webhookUrl: process.env.N8N_WEBHOOK_URL ?? '',
                auth: {
                    user: process.env.N8N_USER ?? '',
                    password: process.env.N8N_PASSWORD ?? ''
                }
            }
        }
    },
    monitoring: {
        enabled: true,
        metricsInterval: 15000
    }
}; 