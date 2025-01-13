#!/bin/bash

# Variables
ENV=${1:-prod}
COMPOSE_FILE="docker-compose.${ENV}.yml"

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Déploiement de l'application en environnement ${ENV}...${NC}"

# Arrêt des conteneurs existants
echo -e "${YELLOW}Arrêt des conteneurs existants...${NC}"
docker-compose -f $COMPOSE_FILE down

# Construction des images
echo -e "${YELLOW}Construction des images...${NC}"
docker-compose -f $COMPOSE_FILE build

# Démarrage des services
echo -e "${YELLOW}Démarrage des services...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Vérification des services
echo -e "${YELLOW}Vérification des services...${NC}"
docker-compose -f $COMPOSE_FILE ps

echo -e "${GREEN}Déploiement terminé !${NC}"

# Affichage des logs
echo -e "${YELLOW}Affichage des logs...${NC}"
docker-compose -f $COMPOSE_FILE logs -f 