.PHONY: test-unit test-integration test-e2e test-coverage test-lint

# Variables de test
TEST_COVERAGE_DIR := ../coverage
TEST_REPORT_DIR := ../reports

# Tests unitaires
test-unit:
	@echo "Exécution des tests unitaires..."
	cd ../frontend && npm run test:unit
	cd ../app/backend && npm run test:unit

# Tests d'intégration
test-integration:
	@echo "Exécution des tests d'intégration..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.test.yml up -d
	cd ../app/backend && npm run test:integration
	docker-compose -f ../docker-compose.yml -f ../docker-compose.test.yml down

# Tests end-to-end
test-e2e:
	@echo "Exécution des tests end-to-end..."
	docker-compose -f ../docker-compose.yml -f ../docker-compose.test.yml up -d
	cd ../frontend && npm run test:e2e
	docker-compose -f ../docker-compose.yml -f ../docker-compose.test.yml down

# Couverture des tests
test-coverage:
	@echo "Génération des rapports de couverture..."
	@mkdir -p $(TEST_COVERAGE_DIR)
	cd ../frontend && npm run test:coverage
	cd ../app/backend && npm run test:coverage
	@echo "Les rapports sont disponibles dans $(TEST_COVERAGE_DIR)"

# Linting
test-lint:
	@echo "Vérification du code..."
	cd ../frontend && npm run lint
	cd ../app/backend && npm run lint 