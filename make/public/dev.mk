.PHONY: dev-install dev-start dev-stop dev-logs dev-clean

# Variables de développement
DEV_PORT := 9080
DEV_MONGO_PORT := 27018
DEV_REDIS_PORT := 6380

# Installation en mode développement
dev-install:
	@echo "Installation des dépendances de développement..."
	cd ../frontend && npm install
	cd ../app/backend && npm install
	npm install -g nodemon

# Démarrage en mode développement
dev-start:
	@echo "Démarrage en mode développement..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.dev.yml up -d
	cd ../frontend && npm run serve &
	cd ../app/backend && nodemon server.js

# Arrêt du mode développement
dev-stop:
	@echo "Arrêt du mode développement..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.dev.yml down
	pkill -f "npm run serve"
	pkill -f "nodemon"

# Logs en mode développement
dev-logs:
	@echo "Affichage des logs de développement..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.dev.yml logs -f

# Nettoyage en mode développement
dev-clean:
	@echo "Nettoyage de l'environnement de développement..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.dev.yml down -v
	rm -rf ../frontend/node_modules
	rm -rf ../app/backend/node_modules
	rm -rf ../frontend/dist
	rm -rf ../app/backend/logs/* 