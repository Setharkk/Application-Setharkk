#!/bin/sh

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fonction pour vérifier PostgreSQL
check_postgres() {
    log "Attente de PostgreSQL..."
    for i in $(seq 1 30); do
        if nc -z postgres 5432; then
            log "✓ PostgreSQL est prêt !"
            return 0
        fi
        log "Tentative $i/30 - PostgreSQL n'est pas encore prêt..."
        sleep 2
    done
    log "❌ Impossible de se connecter à PostgreSQL après 30 tentatives"
    return 1
}

# Fonction pour créer les répertoires
setup_directories() {
    log "Création des répertoires..."
    mkdir -p \
        database/migrations \
        database/seeds \
        logs \
        ssl

    chmod -R 755 database
    chmod -R 700 ssl
    chmod -R 755 logs
    log "✓ Répertoires créés et permissions configurées"
}

# Fonction pour configurer la sécurité
setup_security() {
    log "Configuration de la sécurité..."
    
    # Création des utilisateurs de la base de données
    log "Configuration des utilisateurs de la base de données..."
    psql -h postgres -U postgres -f database/init-users.sql
    
    # Vérification des permissions des fichiers sensibles
    chmod 600 .env
    chmod 600 database/*.sql
    
    log "✓ Configuration de la sécurité terminée"
}

# Fonction pour exécuter les migrations
run_migrations() {
    log "Exécution des migrations..."
    if npm run migrate; then
        log "✓ Migrations exécutées avec succès"
        return 0
    else
        log "❌ Erreur lors de l'exécution des migrations"
        return 1
    fi
}

# Fonction principale
main() {
    log "Démarrage de l'initialisation..."

    # Vérifier PostgreSQL
    if ! check_postgres; then
        exit 1
    fi

    # Créer les répertoires
    setup_directories

    # Configurer la sécurité
    setup_security

    # Exécuter les migrations
    if ! run_migrations; then
        exit 1
    fi

    # Démarrer l'application
    log "Démarrage de l'application..."
    exec npm start
}

# Gestion des signaux
trap 'log "Signal reçu, arrêt propre..."; exit 0' SIGTERM SIGINT

# Exécution du script
main 