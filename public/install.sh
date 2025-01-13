#!/bin/bash

echo "Installation de l'application Setharkk..."

# Création des répertoires nécessaires
echo "Création des répertoires..."
mkdir -p logs uploads temp backups models

# Installation des dépendances Node.js
echo "Installation des dépendances Node.js..."
npm install

# Vérification de MongoDB
echo "Vérification de MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "MongoDB n'est pas installé. Installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install mongodb-community
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
    elif [[ "$OSTYPE" == "msys"* ]]; then
        # Windows
        echo "Veuillez installer MongoDB manuellement depuis https://www.mongodb.com/try/download/community"
    fi
fi

# Vérification de Redis
echo "Vérification de Redis..."
if ! command -v redis-cli &> /dev/null; then
    echo "Redis n'est pas installé. Installation..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install redis
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get install redis-server
    elif [[ "$OSTYPE" == "msys"* ]]; then
        # Windows
        echo "Veuillez installer Redis manuellement depuis https://redis.io/download"
    fi
fi

# Configuration des permissions
echo "Configuration des permissions..."
chmod -R 755 logs uploads temp backups models

# Création du fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cat > .env << EOL
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/setharkk
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
LOG_FILE=logs/app.log
UPLOAD_DIR=uploads
TEMP_DIR=temp
BACKUP_DIR=backups
MODEL_DIR=models
JWT_SECRET=votre_secret_jwt
JWT_EXPIRATION=24h
RATE_LIMIT=100
CACHE_TTL=3600
MAX_CONNECTIONS=1000
ENABLED_MODULES=chat,memory,system
EOL
fi

# Configuration de Git hooks
echo "Configuration des Git hooks..."
if [ -d .git ]; then
    cat > .git/hooks/pre-commit << EOL
#!/bin/sh
npm run lint
npm run type-check
EOL
    chmod +x .git/hooks/pre-commit
fi

echo "Installation terminée avec succès !"
echo "Pour démarrer l'application en mode développement : npm run dev"
echo "Pour démarrer l'application en mode production : npm start" 