export interface Config {
    redis: {
        host: string;
        port: number;
        password?: string;
    };
    elasticsearch: {
        node: string;
        auth?: {
            username: string;
            password: string;
        };
    };
    rabbitmq: {
        url: string;
    };
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
    make: {
        apiKey: string;
        baseUrl: string;
    };
    boost: {
        apiKey: string;
        baseUrl: string;
    };
    seo: {
        openaiApiKey: string;
        elasticsearchUrl: string;
    };
    marketing: {
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            auth: {
                user: string;
                pass: string;
            };
        };
        from: string;
        elasticsearch: {
            node: string;
        };
        rabbitmq: {
            url: string;
        };
    };
    prospection: {
        linkedin: {
            apiKey: string;
            baseUrl: string;
            rabbitmq: {
                url: string;
            };
        };
        crm: {
            apiKey: string;
            baseUrl: string;
        };
    };
    automation: {
        elasticsearch: {
            node: string;
        };
        rabbitmq: {
            url: string;
        };
    };
}

export const config: Config = {
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD
    },
    elasticsearch: {
        node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
        auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD
        } : undefined
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY ?? '',
        model: process.env.OPENAI_MODEL ?? 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '2000')
    },
    afforai: {
        apiKey: process.env.AFFORAI_API_KEY ?? '',
        workspaceId: process.env.AFFORAI_WORKSPACE_ID ?? '',
        baseUrl: process.env.AFFORAI_BASE_URL ?? 'https://api.afforai.com/v1'
    },
    boostSpace: {
        apiToken: process.env.BOOST_SPACE_API_TOKEN ?? '',
        workspaceId: process.env.BOOST_SPACE_WORKSPACE_ID ?? '',
        projectId: process.env.BOOST_SPACE_PROJECT_ID ?? '',
        baseUrl: process.env.BOOST_SPACE_BASE_URL ?? 'https://api.boost.space/v1'
    },
    make: {
        apiKey: process.env.MAKE_API_KEY ?? '',
        baseUrl: process.env.MAKE_BASE_URL ?? 'https://api.make.com/v1'
    },
    boost: {
        apiKey: process.env.BOOST_API_KEY ?? '',
        baseUrl: process.env.BOOST_BASE_URL ?? 'https://api.boost.space/v1'
    },
    seo: {
        openaiApiKey: process.env.SEO_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
        elasticsearchUrl: process.env.SEO_ELASTICSEARCH_URL ?? process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200'
    },
    marketing: {
        smtp: {
            host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT ?? '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER ?? '',
                pass: process.env.SMTP_PASS ?? ''
            }
        },
        from: process.env.EMAIL_FROM ?? 'noreply@example.com',
        elasticsearch: {
            node: process.env.MARKETING_ELASTICSEARCH_URL ?? process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200'
        },
        rabbitmq: {
            url: process.env.MARKETING_RABBITMQ_URL ?? process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'
        }
    },
    prospection: {
        linkedin: {
            apiKey: process.env.LINKEDIN_API_KEY ?? '',
            baseUrl: process.env.LINKEDIN_BASE_URL ?? 'https://api.linkedin.com/v2',
            rabbitmq: {
                url: process.env.LINKEDIN_RABBITMQ_URL ?? process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'
            }
        },
        crm: {
            apiKey: process.env.CRM_API_KEY ?? '',
            baseUrl: process.env.CRM_BASE_URL ?? 'https://api.crm.com/v1'
        }
    },
    automation: {
        elasticsearch: {
            node: process.env.AUTOMATION_ELASTICSEARCH_URL ?? process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200'
        },
        rabbitmq: {
            url: process.env.AUTOMATION_RABBITMQ_URL ?? process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'
        }
    }
}; 