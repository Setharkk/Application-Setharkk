import { Knex } from 'knex';
import dotenv from 'dotenv';

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
            user: process.env.DB_USER || 'setharkk',
            password: process.env.DB_PASSWORD || 'setharkk'
        },
        migrations: {
            directory: './database/migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './database/seeds'
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
    },

    production: {
        client: 'postgresql',
        connection: {
            host: process.env.PROD_DB_HOST || 'postgres',
            port: parseInt(process.env.PROD_DB_PORT || '5432', 10),
            database: process.env.PROD_DB_NAME || 'setharkk_prod',
            user: process.env.PROD_DB_USER || 'setharkk',
            password: process.env.PROD_DB_PASSWORD || 'production_password',
            ssl: { rejectUnauthorized: false }
        },
        migrations: {
            directory: './database/migrations',
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: './database/seeds/production'
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};

export default config; 