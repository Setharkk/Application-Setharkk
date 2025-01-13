#!/bin/sh

# Attendre que les services soient prêts
wait-for-it.sh postgres:5432 -t 60
wait-for-it.sh mongodb:27017 -t 60
wait-for-it.sh redis:6379 -t 60
wait-for-it.sh elasticsearch:9200 -t 60

# Exécuter les migrations de base de données
echo "Exécution des migrations..."
knex migrate:latest

# Démarrer l'application en mode développement
echo "Démarrage de l'application..."
npm run dev 