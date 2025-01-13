import dotenv from 'dotenv';
import knex, { Knex } from 'knex';

dotenv.config();

interface DatabaseConfig {
    client: string;
    connection: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        ssl: boolean | { rejectUnauthorized: boolean };
        charset: string;
        timezone: string;
    };
    pool: {
        min: number;
        max: number;
        idleTimeoutMillis: number;
        createTimeoutMillis: number;
        acquireTimeoutMillis: number;
        propagateCreateError: boolean;
    };
    acquireConnectionTimeout: number;
    debug: boolean;
    asyncStackTraces: boolean;
}

// Configuration avancée pour PostgreSQL
const config: DatabaseConfig = {
    client: 'postgresql',
    connection: {
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'setharkk',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        charset: 'utf8',
        timezone: 'UTC'
    },
    pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
        propagateCreateError: false
    },
    acquireConnectionTimeout: 60000,
    debug: process.env.NODE_ENV === 'development',
    asyncStackTraces: process.env.NODE_ENV === 'development'
};

// Création de la connexion avec gestion des erreurs
async function createConnection(): Promise<Knex> {
    const connection: Knex = knex(config);
    
    // Gestion des événements de connexion
    connection.on('query', (query: Knex.QueryBuilder) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('SQL Query:', query.toString());
        }
    });

    connection.on('query-error', (error: Error, query: Knex.QueryBuilder) => {
        console.error('Erreur SQL:', error);
        console.error('Query:', query.toString());
    });

    // Test initial de connexion
    try {
        await connection.raw('SELECT 1');
        console.log('✓ Base de données connectée avec succès');
        return connection;
    } catch (err) {
        console.error('❌ Erreur de connexion à la base de données:', err);
        throw err;
    }
}

// Export avec gestion asynchrone
export {
    config,
    createConnection,
    createConnection as connection
}; 