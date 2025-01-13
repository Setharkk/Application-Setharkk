import { Knex } from 'knex';

interface DatabaseConnection {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean | { rejectUnauthorized: boolean };
    statement_timeout?: number;
    connectionTimeoutMillis?: number;
}

interface DatabasePool {
    min: number;
    max: number;
    createTimeoutMillis?: number;
    acquireTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    reapIntervalMillis?: number;
    createRetryIntervalMillis?: number;
    propagateCreateError?: boolean;
}

interface DatabaseMigrations {
    directory: string;
    tableName: string;
    loadExtensions: string[];
}

interface DatabaseSeeds {
    directory: string;
}

interface DatabaseConfig {
    client: string;
    connection: DatabaseConnection;
    pool: DatabasePool;
    migrations: DatabaseMigrations;
    seeds?: DatabaseSeeds;
    debug?: boolean;
    acquireConnectionTimeout?: number;
}

interface Config {
    development: DatabaseConfig;
    test: DatabaseConfig;
    production: DatabaseConfig;
}

const config: Config = {
    development: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'setharkk_dev',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        },
        pool: {
            min: 2,
            max: 10,
            createTimeoutMillis: 3000,
            acquireTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
            propagateCreateError: false
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations',
            loadExtensions: ['.js', '.ts']
        },
        seeds: {
            directory: './seeds'
        },
        debug: process.env.DB_DEBUG === 'true'
    },

    test: {
        client: 'postgresql',
        connection: {
            host: process.env.TEST_DB_HOST || 'localhost',
            port: Number(process.env.TEST_DB_PORT) || 5432,
            database: process.env.TEST_DB_NAME || 'setharkk_test',
            user: process.env.TEST_DB_USER || 'postgres',
            password: process.env.TEST_DB_PASSWORD || 'postgres',
            ssl: process.env.TEST_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        },
        pool: {
            min: 2,
            max: 10,
            idleTimeoutMillis: 30000
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations',
            loadExtensions: ['.js', '.ts']
        },
        seeds: {
            directory: './seeds'
        }
    },

    production: {
        client: 'postgresql',
        connection: {
            host: process.env.PROD_DB_HOST as string,
            port: Number(process.env.PROD_DB_PORT) || 5432,
            database: process.env.PROD_DB_NAME as string,
            user: process.env.PROD_DB_USER as string,
            password: process.env.PROD_DB_PASSWORD as string,
            ssl: { rejectUnauthorized: false },
            statement_timeout: 10000,
            connectionTimeoutMillis: 10000
        },
        pool: {
            min: 2,
            max: 20,
            createTimeoutMillis: 3000,
            acquireTimeoutMillis: 60000,
            idleTimeoutMillis: 60000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
            propagateCreateError: false
        },
        migrations: {
            directory: './migrations',
            tableName: 'knex_migrations',
            loadExtensions: ['.js']
        },
        acquireConnectionTimeout: 60000,
        debug: false
    }
};

function validateConfig(env: keyof Config): void {
    const envConfig = config[env];
    if (!envConfig) {
        throw new Error(`Configuration non trouvée pour l'environnement: ${env}`);
    }

    const requiredKeys: Array<keyof DatabaseConfig> = ['client', 'connection', 'pool', 'migrations'];
    for (const key of requiredKeys) {
        if (!envConfig[key]) {
            throw new Error(`Configuration manquante: ${key} pour l'environnement ${env}`);
        }
    }

    if (env === 'production') {
        const requiredEnvVars = [
            'PROD_DB_HOST',
            'PROD_DB_NAME',
            'PROD_DB_USER',
            'PROD_DB_PASSWORD'
        ];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Variable d'environnement manquante: ${envVar}`);
            }
        }
    }
}

const currentEnv = (process.env.NODE_ENV || 'development') as keyof Config;
validateConfig(currentEnv);

export default config; 