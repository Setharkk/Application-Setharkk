FROM node:18-alpine as base

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    netcat-openbsd \
    postgresql-client \
    redis

# Installation des outils de développement
RUN apk add --no-cache --virtual .build-deps \
    postgresql-dev

FROM base as development

# Copie des fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY knexfile.ts ./

# Installation des dépendances
RUN npm install && \
    npm install -g nodemon ts-node typescript knex && \
    npm install pg @types/pg @elastic/elasticsearch

# Configuration de l'environnement
ENV NODE_ENV=development \
    PATH=/app/node_modules/.bin:$PATH \
    ELASTICSEARCH_URL=http://elasticsearch:9200

# Scripts d'attente pour les dépendances
COPY ./scripts/wait-for-it.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Le code source sera monté en volume
EXPOSE 3000

# Ajout des healthchecks
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Script de démarrage
COPY ./scripts/start-dev.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-dev.sh

CMD ["start-dev.sh"] 