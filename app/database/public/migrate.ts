import dotenv from 'dotenv';
import { createConnection } from './connection';
import { promises as fs } from 'fs';
import path from 'path';
import { Knex } from 'knex';

dotenv.config();

// Fonction pour nettoyer et valider le SQL
function sanitizeSQL(sql: string): string[] {
    return sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd && !cmd.startsWith('--'));
}

// Fonction pour exécuter une commande SQL avec retry
async function executeWithRetry(connection: Knex, command: string, retries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await connection.raw(command);
            return;
        } catch (error) {
            if (attempt === retries) throw error;
            console.log(`Tentative ${attempt} échouée, nouvelle tentative dans 2 secondes...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function migrate(isRollback: boolean = false): Promise<void> {
    let connection: Knex | undefined;
    console.log(`[${new Date().toISOString()}] Démarrage de la migration...`);
    
    try {
        // Établir la connexion
        connection = await createConnection();
        console.log('✓ Connexion établie');

        if (isRollback) {
            console.log('Exécution du rollback...');
            await connection.raw(`
                DO $$ 
                DECLARE 
                    r RECORD;
                BEGIN
                    FOR r IN (
                        SELECT tablename 
                        FROM pg_tables 
                        WHERE schemaname = current_schema()
                        AND tablename != 'knex_migrations'
                        AND tablename != 'knex_migrations_lock'
                    ) LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            `);
            console.log('✓ Rollback effectué');
            return;
        }

        // Lire le fichier de migration
        const migrationPath = path.join(__dirname, 'migrations', '002_unified_schema.sql');
        console.log(`Lecture du fichier: ${migrationPath}`);
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        
        // Exécuter les commandes
        console.log('Exécution des commandes SQL...');
        const commands = sanitizeSQL(migrationSQL);
        
        for (const [index, command] of commands.entries()) {
            try {
                console.log(`Exécution de la commande ${index + 1}/${commands.length}`);
                await executeWithRetry(connection, command);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('❌ Erreur SQL:', error.message);
                    console.error('Commande:', command);
                }
                throw error;
            }
        }
        
        console.log('✓ Migration terminée avec succès');

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    } finally {
        if (connection) {
            try {
                await connection.destroy();
                console.log('✓ Connexion fermée');
            } catch (error) {
                console.error('❌ Erreur lors de la fermeture:', error);
            }
        }
    }
}

// Gestion des signaux pour arrêt propre
process.on('SIGTERM', () => {
    console.log('Signal SIGTERM reçu. Arrêt...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Signal SIGINT reçu. Arrêt...');
    process.exit(0);
});

// Exécution avec gestion des erreurs globale
const isRollback = process.argv.includes('rollback');

migrate(isRollback)
    .then(() => {
        console.log(`[${new Date().toISOString()}] Migration terminée avec succès`);
        process.exit(0);
    })
    .catch((error: unknown) => {
        console.error(`[${new Date().toISOString()}] Erreur fatale:`, error);
        process.exit(1);
    }); 