# Stage de base
FROM node:18-alpine AS base

# Configuration du répertoire de travail
WORKDIR /app

# Installation des dépendances système
RUN apk add --no-cache \
    ca-certificates \
    chromium \
    curl \
    freetype \
    freetype-dev \
    g++ \
    make \
    nss \
    python3 \
    ttf-freefont

# Configuration de Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copie des fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./

# Stage de développement
FROM base AS development

# Installation des dépendances de développement
RUN npm install

# Variables d'environnement pour le développement
ENV NODE_ENV=development \
    PORT=3000 \
    MONGODB_URI=mongodb://mongodb:27017/setharkk \
    REDIS_URI=redis://redis:6379 \
    POSTGRES_URI=postgresql://setharkk:setharkk@postgres:5432/setharkk \
    ELASTICSEARCH_NODE=http://elasticsearch:9200 \
    RABBITMQ_URI=amqp://rabbitmq:5672

# Copie du code source
COPY . .

# Exposition du port
EXPOSE 3000

# Commande de développement
CMD ["npm", "run", "dev"]

# Stage de production
FROM base AS production

# Installation des dépendances de production
RUN npm ci && \
    npm install -g typescript && \
    npm install --save \
        openai \
        @types/node \
        puppeteer \
        @elastic/elasticsearch \
        node-cron \
        @types/node-cron \
        express \
        cors \
        dotenv \
        winston \
        amqplib \
        @types/amqplib && \
    npm cache clean --force

# Copie du code source
COPY . .

# Construction du projet
RUN npm run build

# Variables d'environnement pour la production
ENV NODE_ENV=production \
    PORT=3000 \
    MONGODB_URI=mongodb://mongodb:27017/setharkk \
    REDIS_URI=redis://redis:6379 \
    POSTGRES_URI=postgresql://setharkk:setharkk@postgres:5432/setharkk \
    ELASTICSEARCH_NODE=http://elasticsearch:9200 \
    RABBITMQ_URI=amqp://rabbitmq:5672

# Exposition du port
EXPOSE 3000

# Vérification de santé
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["curl", "-f", "http://localhost:3000/health"]

# Démarrage en production
CMD ["npm", "start"] 