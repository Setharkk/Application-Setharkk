#!/bin/sh
set -e

# Fonction pour le logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Vérification de l'environnement
if [ ! -f "/etc/nginx/conf.d/default.conf" ]; then
    log "ERROR: Configuration Nginx manquante"
    exit 1
fi

# Vérification des fichiers statiques
if [ ! -d "/usr/share/nginx/html" ] || [ ! -f "/usr/share/nginx/html/index.html" ]; then
    log "ERROR: Fichiers statiques manquants"
    exit 1
fi

# Vérification des permissions des répertoires nginx
for dir in /var/cache/nginx /var/log/nginx /var/run /etc/nginx/conf.d /usr/share/nginx/html; do
    if [ ! -d "$dir" ]; then
        log "ERROR: Répertoire $dir manquant"
        exit 1
    fi
    
    if ! su-exec nginx test -w "$dir"; then
        log "ERROR: Le répertoire $dir n'est pas accessible en écriture pour nginx"
        exit 1
    fi
done

# Création des répertoires de cache si nécessaire
for dir in /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        chown -R nginx:nginx "$dir"
        chmod -R 755 "$dir"
    fi
done

# Test de la configuration nginx
log "Vérification de la configuration Nginx..."
nginx -t || exit 1

# Démarrage de nginx avec l'utilisateur approprié
if [ "$1" = "nginx" ]; then
    log "Démarrage de Nginx..."
    exec nginx -g "daemon off;"
else
    log "Exécution de la commande: $@"
    exec "$@"
fi 