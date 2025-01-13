-- Script d'initialisation sécurisé de la base de données Setharkk
-- Version: 2.0
-- Date: 2024-01-15

-- Bloc 1: Vérification préliminaire et création de la base de données
DO $$ 
DECLARE
    db_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_database WHERE datname = 'setharkk'
    ) INTO db_exists;

    IF NOT db_exists THEN
        PERFORM dblink_exec('dbname=' || current_database(), 
            'CREATE DATABASE setharkk WITH ENCODING = ''UTF8'' LC_COLLATE = ''fr_FR.UTF-8'' LC_CTYPE = ''fr_FR.UTF-8'' TEMPLATE template0;'
        );
    END IF;
END $$;

-- Bloc 2: Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "dblink";

-- Bloc 3: Configuration du serveur PostgreSQL
DO $$ 
BEGIN
    -- Paramètres de sécurité SSL
    ALTER SYSTEM SET ssl TO on;
    ALTER SYSTEM SET ssl_ciphers TO 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ALTER SYSTEM SET password_encryption TO 'scram-sha-256';
    ALTER SYSTEM SET ssl_prefer_server_ciphers TO on;
    ALTER SYSTEM SET ssl_min_protocol_version TO 'TLSv1.2';

    -- Paramètres de connexion
    ALTER SYSTEM SET tcp_keepalives_idle TO 300;
    ALTER SYSTEM SET tcp_keepalives_interval TO 60;
    ALTER SYSTEM SET tcp_keepalives_count TO 3;
    ALTER SYSTEM SET statement_timeout TO '30s';
    ALTER SYSTEM SET lock_timeout TO '5s';
    ALTER SYSTEM SET idle_in_transaction_session_timeout TO '60s';

    -- Paramètres de journalisation
    ALTER SYSTEM SET logging_collector TO on;
    ALTER SYSTEM SET log_destination TO 'csvlog';
    ALTER SYSTEM SET log_directory TO 'pg_log';
    ALTER SYSTEM SET log_filename TO 'postgresql-%Y-%m-%d_%H%M%S.log';
    ALTER SYSTEM SET log_rotation_age TO '1d';
    ALTER SYSTEM SET log_rotation_size TO '100MB';
    ALTER SYSTEM SET log_min_duration_statement TO 1000;
    ALTER SYSTEM SET log_connections TO on;
    ALTER SYSTEM SET log_disconnections TO on;
    ALTER SYSTEM SET log_line_prefix TO '%m [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
    ALTER SYSTEM SET log_statement TO 'mod';
    ALTER SYSTEM SET log_min_error_statement TO 'error';
    ALTER SYSTEM SET log_min_messages TO 'warning';

    -- Paramètres de performance et sécurité
    ALTER SYSTEM SET shared_buffers TO '256MB';
    ALTER SYSTEM SET work_mem TO '64MB';
    ALTER SYSTEM SET maintenance_work_mem TO '256MB';
    ALTER SYSTEM SET effective_cache_size TO '1GB';
    ALTER SYSTEM SET max_connections TO '100';
    ALTER SYSTEM SET max_prepared_transactions TO '0';
END $$;

-- Bloc 4: Création du schéma sécurisé
CREATE SCHEMA IF NOT EXISTS setharkk AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA setharkk FROM PUBLIC;

-- Bloc 5: Création des rôles avec vérification
DO $$ 
DECLARE
    app_password text := 'Setharkk_App_2024_#' || encode(gen_random_bytes(16), 'hex');
    monitor_password text := 'Setharkk_Monitor_2024_#' || encode(gen_random_bytes(16), 'hex');
BEGIN
    -- Rôle applicatif
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'setharkk_app') THEN
        CREATE ROLE setharkk_app LOGIN 
        PASSWORD 'Setharkk_App_2024_#Secure'
        VALID UNTIL '2025-12-31'
        CONNECTION LIMIT 100
        NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION;
    END IF;

    -- Rôle monitoring
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'setharkk_monitor') THEN
        CREATE ROLE setharkk_monitor LOGIN 
        PASSWORD 'Setharkk_Monitor_2024_#Secure'
        VALID UNTIL '2025-12-31'
        CONNECTION LIMIT 10
        NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION;
    END IF;
END $$;

-- Bloc 6: Configuration des chemins de recherche et privilèges
ALTER ROLE setharkk_app SET search_path TO setharkk, public;
ALTER ROLE setharkk_monitor SET search_path TO setharkk, public;
ALTER ROLE setharkk_app SET statement_timeout TO '30s';
ALTER ROLE setharkk_monitor SET statement_timeout TO '60s';

-- Bloc 7: Attribution des privilèges
DO $$ 
BEGIN
    -- Privilèges applicatifs
    EXECUTE 'GRANT CONNECT ON DATABASE setharkk TO setharkk_app';
    EXECUTE 'GRANT USAGE ON SCHEMA setharkk TO setharkk_app';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA setharkk TO setharkk_app';
    EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA setharkk TO setharkk_app';
    EXECUTE 'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA setharkk TO setharkk_app';

    -- Privilèges monitoring
    EXECUTE 'GRANT CONNECT ON DATABASE setharkk TO setharkk_monitor';
    EXECUTE 'GRANT USAGE ON SCHEMA setharkk TO setharkk_monitor';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA setharkk TO setharkk_monitor';
    
    -- Révocation des privilèges publics
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON SCHEMA public FROM PUBLIC';
END $$;

-- Bloc 8: Création des tables système
CREATE TABLE IF NOT EXISTS setharkk.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS setharkk.error_logs (
    id BIGSERIAL PRIMARY KEY,
    error_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_level VARCHAR(20) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB
);

-- Bloc 9: Fonctions système
CREATE OR REPLACE FUNCTION setharkk.audit_trigger_func() 
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data = row_to_json(OLD)::JSONB;
        INSERT INTO setharkk.audit_logs (action, table_name, record_id, old_data)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id, old_data);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data = row_to_json(OLD)::JSONB;
        new_data = row_to_json(NEW)::JSONB;
        INSERT INTO setharkk.audit_logs (action, table_name, record_id, old_data, new_data)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, old_data, new_data);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        new_data = row_to_json(NEW)::JSONB;
        INSERT INTO setharkk.audit_logs (action, table_name, record_id, new_data)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, new_data);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = setharkk, public;

-- Bloc 10: Fonction de maintenance
CREATE OR REPLACE FUNCTION setharkk.cleanup_logs() 
RETURNS void AS $$
BEGIN
    -- Suppression des logs de plus de 90 jours
    DELETE FROM setharkk.audit_logs 
    WHERE event_time < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    DELETE FROM setharkk.error_logs 
    WHERE error_time < CURRENT_TIMESTAMP - INTERVAL '90 days';

    -- Compression des logs plus anciens que 30 jours
    UPDATE setharkk.audit_logs 
    SET old_data = compress(old_data::text::bytea),
        new_data = compress(new_data::text::bytea)
    WHERE event_time < CURRENT_TIMESTAMP - INTERVAL '30 days'
    AND old_data IS NOT NULL
    AND NOT octet_length(old_data::text) = octet_length(compress(old_data::text::bytea));

EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO setharkk.error_logs (error_level, error_message, stack_trace)
        VALUES ('ERROR', 'Erreur dans cleanup_logs: ' || SQLERRM, pg_backend_pid()::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = setharkk, public;

-- Bloc 11: Index de performance
DO $$
BEGIN
    -- Index pour les audit logs
    CREATE INDEX IF NOT EXISTS idx_audit_logs_event_time 
        ON setharkk.audit_logs (event_time DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
        ON setharkk.audit_logs (user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
        ON setharkk.audit_logs (action);

    -- Index pour les error logs
    CREATE INDEX IF NOT EXISTS idx_error_logs_error_time 
        ON setharkk.error_logs (error_time DESC);
    CREATE INDEX IF NOT EXISTS idx_error_logs_error_level 
        ON setharkk.error_logs (error_level);
END $$;

-- Bloc 12: Planification des tâches de maintenance
SELECT cron.schedule('0 3 * * *', $$
    SELECT setharkk.cleanup_logs();
$$);

-- Bloc 13: Validation finale
DO $$
BEGIN
    -- Vérification des extensions
    ASSERT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
    ), 'Extension uuid-ossp non installée';
    
    ASSERT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
    ), 'Extension pgcrypto non installée';

    -- Vérification des rôles
    ASSERT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'setharkk_app'
    ), 'Rôle setharkk_app non créé';
    
    ASSERT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'setharkk_monitor'
    ), 'Rôle setharkk_monitor non créé';

    -- Vérification du schéma
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'setharkk'
    ), 'Schéma setharkk non créé';

    RAISE NOTICE 'Validation finale réussie';
END $$; 