.PHONY: install start stop restart logs clean test build deploy

# Variables
ENV_FILE := ../.env
include $(ENV_FILE)
export

# Installation des dépendances
install:
	@echo "Installation des dépendances..."
	cd ../frontend && npm install
	cd ../app/backend && npm install

# Démarrage des services
start:
	@echo "Démarrage des services..."
	docker-compose -f ../docker-compose.yml up -d

# Arrêt des services
stop:
	@echo "Arrêt des services..."
	docker-compose -f ../docker-compose.yml down

# Redémarrage des services
restart: stop start

# Affichage des logs
logs:
	@echo "Affichage des logs..."
	docker-compose -f ../docker-compose.yml logs -f

# Nettoyage
clean:
	@echo "Nettoyage..."
	docker-compose -f ../docker-compose.yml down -v
	rm -rf ../frontend/node_modules
	rm -rf ../app/backend/node_modules
	rm -rf ../frontend/dist

# Tests
test:
	@echo "Exécution des tests..."
	cd ../frontend && npm test
	cd ../app/backend && npm test

# Build
build:
	@echo "Construction des images..."
	docker-compose -f ../docker-compose.yml build --no-cache

# Déploiement
deploy: build
	@echo "Déploiement..."
	docker-compose -f ../docker-compose.yml up -d 