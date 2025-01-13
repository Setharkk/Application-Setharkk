FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache make gcc g++ python3

# Copier les fichiers de dépendances
COPY ../../backend/package*.json ./

# Installer les dépendances
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copier le code source du backend
COPY ../../backend/ ./
COPY ../../database/ ./database/

EXPOSE 8080

CMD ["npm", "start"] 