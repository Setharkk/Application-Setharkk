import dotenv from 'dotenv';
dotenv.config();

export const config = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        apiPrefix: '/api/v1'
    },
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/assistant',
        options: {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        }
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'votre_clé_secrète_par_défaut',
        jwtExpiration: '24h'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo',
        maxTokens: 150
    },
    afforai: {
        apiKey: process.env.AFFORAI_API_KEY,
        workspaceId: process.env.AFFORAI_WORKSPACE_ID,
        baseUrl: 'https://api.afforai.com/v1'
    },
    boostSpace: {
        apiToken: process.env.BOOST_SPACE_API_TOKEN,
        workspaceId: process.env.BOOST_SPACE_WORKSPACE_ID,
        projectId: process.env.BOOST_SPACE_PROJECT_ID,
        baseUrl: 'https://api.boost.space/v1'
    },
    cache: {
        defaultTTL: 3600,
        checkPeriod: 600
    },
    monitoring: {
        enabled: true,
        metricsInterval: 15000
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
} as const; 