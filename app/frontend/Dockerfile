FROM node:18-alpine AS base

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache curl

FROM base AS development

# Copie des fichiers de configuration
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# Installation des dépendances
RUN npm install && \
    npm install -g vite typescript

# Configuration de l'environnement
ENV NODE_ENV=development \
    PATH=/app/node_modules/.bin:$PATH

# Le code source sera monté en volume
EXPOSE 5173

# Ajout des healthchecks
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["curl", "-f", "http://localhost:5173/health"]

CMD ["npm", "run", "dev"] 