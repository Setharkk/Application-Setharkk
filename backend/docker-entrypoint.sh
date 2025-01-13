#!/bin/sh

# Attendre que MongoDB soit prêt
echo "Attente de MongoDB..."
until curl -s mongodb:27017 >/dev/null; do
    echo "MongoDB n'est pas encore prêt - attente..."
    sleep 2
done

# Attendre que Redis soit prêt
echo "Attente de Redis..."
until nc -z redis 6379; do
    echo "Redis n'est pas encore prêt - attente..."
    sleep 2
done

echo "Démarrage du serveur backend..."
exec npm start 