.PHONY: prod-build prod-deploy prod-rollback prod-logs prod-clean

# Variables de production
PROD_VERSION := $(shell date +%Y%m%d_%H%M%S)
BACKUP_DIR := ../backups

# Construction pour la production
prod-build:
	@echo "Construction des images de production..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml build --no-cache
	docker tag applicationsetharkk-frontend:latest applicationsetharkk-frontend:$(PROD_VERSION)
	docker tag applicationsetharkk-backend:latest applicationsetharkk-backend:$(PROD_VERSION)

# Déploiement en production
prod-deploy:
	@echo "Déploiement en production..."
	@mkdir -p $(BACKUP_DIR)
	@echo $(PROD_VERSION) > $(BACKUP_DIR)/current_version
	docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml up -d

# Rollback en production
prod-rollback:
	@echo "Rollback en production..."
	@if [ -f $(BACKUP_DIR)/current_version ]; then \
		PREV_VERSION=$$(cat $(BACKUP_DIR)/current_version); \
		docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml down; \
		docker tag applicationsetharkk-frontend:$$PREV_VERSION applicationsetharkk-frontend:latest; \
		docker tag applicationsetharkk-backend:$$PREV_VERSION applicationsetharkk-backend:latest; \
		docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml up -d; \
	else \
		echo "Aucune version précédente trouvée"; \
		exit 1; \
	fi

# Logs de production
prod-logs:
	@echo "Affichage des logs de production..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml logs -f

# Nettoyage de production
prod-clean:
	@echo "Nettoyage de l'environnement de production..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml down -v
	docker system prune -af --volumes
	rm -rf $(BACKUP_DIR)/* 