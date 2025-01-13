#!/bin/bash

# Configuration des variables
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MONGODB_BACKUP_PATH="/backup/mongodb"
REDIS_BACKUP_PATH="/backup/redis"
ELASTICSEARCH_BACKUP_PATH="/backup/elasticsearch"

# Fonction de backup MongoDB
backup_mongodb() {
    echo "Démarrage de la sauvegarde MongoDB..."
    mongodump --uri="$MONGODB_URI" --out="${MONGODB_BACKUP_PATH}/${TIMESTAMP}"
}

# Fonction de backup Redis
backup_redis() {
    echo "Démarrage de la sauvegarde Redis..."
    redis-cli -u "$REDIS_URL" --rdb "${REDIS_BACKUP_PATH}/dump_${TIMESTAMP}.rdb"
}

# Fonction de backup Elasticsearch
backup_elasticsearch() {
    echo "Démarrage de la sauvegarde Elasticsearch..."
    curl -X PUT "${ELASTICSEARCH_URL}/_snapshot/backup_${TIMESTAMP}"
}

# Exécution des backups
backup_mongodb
backup_redis
backup_elasticsearch

echo "Sauvegardes terminées avec succès!" 