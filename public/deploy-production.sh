#!/bin/bash

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SERVER_USER="votre_utilisateur"
SERVER_HOST="votre_serveur.com"
DEPLOY_PATH="/var/www/setharkk"
BACKUP_PATH="/var/backups/setharkk"

# Fonction pour les logs
log() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERREUR] $1${NC}"
    exit 1
}

# Vérification des prérequis
command -v ssh >/dev/null 2>&1 || error "SSH n'est pas installé"
command -v rsync >/dev/null 2>&1 || error "rsync n'est pas installé"

# Création du backup
log "Création d'un backup..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $BACKUP_PATH && \
    cd $DEPLOY_PATH && \
    tar czf $BACKUP_PATH/backup-$(date +'%Y%m%d-%H%M%S').tar.gz ."

# Copie des fichiers
log "Copie des fichiers vers le serveur..."
rsync -avz --exclude 'node_modules' \
          --exclude '.git' \
          --exclude '.env' \
          --exclude 'logs' \
          --exclude 'dist' \
          --exclude 'build' \
          . $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH

# Configuration des variables d'environnement
log "Configuration des variables d'environnement..."
scp .env.production $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/.env

# Configuration des permissions
log "Configuration des permissions..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && \
    chmod +x deploy.sh && \
    chmod +x *.sh && \
    sudo chown -R $SERVER_USER:$SERVER_USER . && \
    sudo chmod -R 755 . && \
    sudo find . -type f -exec chmod 644 {} \; && \
    sudo find . -type d -exec chmod 755 {} \;"

# Déploiement avec Docker
log "Déploiement de l'application..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && \
    ./deploy.sh prod"

# Vérification du déploiement
log "Vérification du déploiement..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && \
    docker-compose -f docker-compose.prod.yml ps"

# Nettoyage des anciens backups (garde les 7 derniers jours)
log "Nettoyage des anciens backups..."
ssh $SERVER_USER@$SERVER_HOST "find $BACKUP_PATH -name 'backup-*.tar.gz' -mtime +7 -delete"

echo -e "${GREEN}Déploiement terminé avec succès !${NC}"

# Affichage des logs
log "Affichage des logs de l'application..."
ssh $SERVER_USER@$SERVER_HOST "cd $DEPLOY_PATH && \
    docker-compose -f docker-compose.prod.yml logs -f" 