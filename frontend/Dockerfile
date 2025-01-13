# Stage de base
FROM node:18-alpine AS base

# Configuration du répertoire de travail
WORKDIR /app

# Installation des dépendances globales
RUN apk add --no-cache curl

# Copie des fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Stage de développement
FROM base AS development

# Installation des dépendances de développement
RUN npm install

# Variables d'environnement pour le développement
ENV NODE_ENV=development \
    VITE_API_URL=http://localhost:3001

# Exposition du port
EXPOSE 3000

# Commande de développement
CMD ["npm", "run", "dev", "--", "--port", "3000", "--host"]

# Stage de production
FROM base AS production

# Installation des dépendances de production
RUN npm ci && \
    npm cache clean --force && \
    npm install -g typescript vite && \
    npm rebuild esbuild

# Copie du code source
COPY . .

# Variables d'environnement pour la production
ENV NODE_ENV=production \
    VITE_API_URL=http://localhost:3001

# Construction du projet
RUN npm run build

# Stage de service
FROM nginx:alpine AS serve

# Installation des outils de surveillance
RUN apk add --no-cache curl

# Copie des fichiers construits
COPY --from=production /app/dist /usr/share/nginx/html

# Configuration de Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Exposition du port
EXPOSE 3000

# Vérification de santé
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ["curl", "-f", "http://localhost:3000/"]

# Démarrage du serveur
CMD ["nginx", "-g", "daemon off;"] 