.PHONY: docker-build docker-push docker-pull docker-clean docker-prune

# Variables Docker
DOCKER_REGISTRY := docker.io
DOCKER_NAMESPACE := setharkk
DOCKER_TAG := $(shell date +%Y%m%d_%H%M%S)

# Construction des images Docker
docker-build:
	@echo "Construction des images Docker..."
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:$(DOCKER_TAG) ../frontend
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:$(DOCKER_TAG) ../app/backend
	docker tag $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:$(DOCKER_TAG) $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:latest
	docker tag $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:$(DOCKER_TAG) $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:latest

# Push des images vers le registry
docker-push:
	@echo "Push des images vers le registry..."
	docker push $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:$(DOCKER_TAG)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:$(DOCKER_TAG)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:latest
	docker push $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:latest

# Pull des images depuis le registry
docker-pull:
	@echo "Pull des images depuis le registry..."
	docker pull $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:latest
	docker pull $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:latest

# Nettoyage des images Docker
docker-clean:
	@echo "Nettoyage des images Docker..."
	docker rmi $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:$(DOCKER_TAG) || true
	docker rmi $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:$(DOCKER_TAG) || true
	docker rmi $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/frontend:latest || true
	docker rmi $(DOCKER_REGISTRY)/$(DOCKER_NAMESPACE)/backend:latest || true

# Nettoyage complet de Docker
docker-prune:
	@echo "Nettoyage complet de Docker..."
	docker system prune -af --volumes 