FROM node:18-alpine as base

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie des fichiers source et configuration TypeScript
COPY tsconfig.json ./
COPY src ./src

# Étape de développement
FROM base as development
CMD ["npm", "run", "dev"]

# Étape de production
FROM base as production

# Build TypeScript
RUN npm run build

# Nettoyage des dépendances de développement
RUN npm prune --production

# Exposition du port
EXPOSE 9091

# Commande de démarrage
CMD ["node", "dist/index.js"] 