#!/bin/bash

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Vérification des permissions des fichiers
check_file_permissions() {
    log "Vérification des permissions des fichiers..."
    
    # Liste des fichiers sensibles
    files_to_check=(
        ".env"
        "database/*.sql"
        "ssl/*"
    )
    
    for file in "${files_to_check[@]}"; do
        if [ $(stat -c %a "$file") -gt 600 ]; then
            log "⚠️ ATTENTION: $file a des permissions trop permissives"
        fi
    done
}

# Vérification des connexions à la base de données
check_db_connections() {
    log "Vérification des connexions à la base de données..."
    
    # Vérifier les connexions actives
    psql -h postgres -U postgres -c "SELECT * FROM pg_stat_activity;" > /dev/null
    
    if [ $? -ne 0 ]; then
        log "⚠️ ERREUR: Impossible de vérifier les connexions à la base de données"
    fi
}

# Vérification de Redis
check_redis() {
    log "Vérification de Redis..."
    
    # Tester la connexion Redis avec mot de passe
    redis-cli -h redis -a "$REDIS_PASSWORD" ping > /dev/null
    
    if [ $? -ne 0 ]; then
        log "⚠️ ERREUR: Impossible de se connecter à Redis"
    fi
}

# Vérification des certificats SSL
check_ssl() {
    log "Vérification des certificats SSL..."
    
    # Vérifier l'existence des certificats
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/cert.key" ]; then
        log "⚠️ ERREUR: Certificats SSL manquants"
    fi
}

# Vérification des dépendances
check_dependencies() {
    log "Vérification des dépendances..."
    
    # Vérifier les vulnérabilités npm
    npm audit
    
    if [ $? -ne 0 ]; then
        log "⚠️ ATTENTION: Des vulnérabilités ont été trouvées dans les dépendances"
    fi
}

# Fonction principale
main() {
    log "Démarrage de la vérification de sécurité..."
    
    check_file_permissions
    check_db_connections
    check_redis
    check_ssl
    check_dependencies
    
    log "Vérification de sécurité terminée"
}

# Exécution du script
main 