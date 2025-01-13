# Étape de build
FROM node:18-alpine AS build-stage

WORKDIR /app

# Installation des dépendances de base
RUN apk add --no-cache git

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production
FROM nginx:alpine AS production-stage

# Copie des fichiers de build
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copie de la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"] 