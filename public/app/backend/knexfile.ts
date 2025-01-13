import dotenv from 'dotenv';
import path from 'path';
import { Knex } from 'knex';

// Charger les variables d'environnement
dotenv.config();

interface KnexConfig {
    [key: string]: Knex.Config;
}

const config: KnexConfig = {
    development: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME || 'setharkk',
            user: process.env.DB_USER || 'setharkk_app',
            password: process.env.DB_PASSWORD || 'Setharkk_2024_Secure!'
        },
        migrations: {
            directory: './database/migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './database/seeds'
        }
    },
    production: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        },
        migrations: {
            directory: './database/migrations',
            tableName: 'knex_migrations'
        },
        pool: {
            min: 2,
            max: 10,
            acquireTimeoutMillis: 60000,
            createTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100
        }
    },
    test: {
        client: 'postgresql',
        connection: {
            host: process.env.TEST_DB_HOST || 'postgres',
            port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
            database: process.env.TEST_DB_NAME || 'setharkk_test',
            user: process.env.TEST_DB_USER || 'setharkk_test',
            password: process.env.TEST_DB_PASSWORD || 'test_password'
        },
        migrations: {
            directory: './database/migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './database/seeds/test'
        }
    }
};

export default config; 