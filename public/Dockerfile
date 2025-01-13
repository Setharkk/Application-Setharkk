# Build stage
FROM node:18-alpine

# Installation des dépendances système
RUN apk add --no-cache \
    g++ \
    make \
    netcat-openbsd \
    postgresql-client \
    python3

# Création du répertoire de l'application
WORKDIR /app

# Copie des fichiers de dépendances
COPY app/package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du reste des fichiers
COPY app .

# Création des répertoires nécessaires
RUN mkdir -p \
    /app/database/migrations \
    /app/database/seeds \
    /app/logs \
    && chmod -R 755 /app/database \
    && chmod -R 755 /app/logs

# Copie du script d'initialisation
COPY app/init.sh /app/init.sh
RUN chmod +x /app/init.sh

# Variables d'environnement
ENV NODE_ENV=production \
    PORT=3000

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["/app/init.sh"] 