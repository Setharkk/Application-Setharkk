FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache make gcc g++ python3 curl

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copier le code source
COPY . .

# Créer le répertoire pour les logs
RUN mkdir -p /app/logs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Démarrer l'application
CMD ["npm", "start"] 