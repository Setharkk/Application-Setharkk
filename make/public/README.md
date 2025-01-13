# Make Configuration

Ce dossier contient les fichiers de configuration Make pour l'application Setharkk.

## Structure

- `Makefile` : Fichier principal avec les commandes de base
- `dev.mk` : Configuration pour le développement
- `prod.mk` : Configuration pour la production
- `test.mk` : Configuration pour les tests
- `docker.mk` : Configuration pour Docker

## Commandes principales

### Installation

```bash
make install        # Installation des dépendances
make dev-install   # Installation en mode développement
```

### Développement

```bash
make dev-start     # Démarrage en mode développement
make dev-stop      # Arrêt du mode développement
make dev-logs      # Affichage des logs de développement
```

### Production

```bash
make prod-build    # Construction pour la production
make prod-deploy   # Déploiement en production
make prod-rollback # Rollback en production
```

### Tests

```bash
make test-unit       # Tests unitaires
make test-integration # Tests d'intégration
make test-e2e        # Tests end-to-end
make test-coverage   # Rapports de couverture
```

### Docker

```bash
make docker-build   # Construction des images
make docker-push    # Push vers le registry
make docker-pull    # Pull depuis le registry
make docker-clean   # Nettoyage des images
```

## Variables d'environnement

Les variables d'environnement sont chargées depuis le fichier `.env` à la racine du projet.

## Personnalisation

Vous pouvez modifier les fichiers Make selon vos besoins :

- Ajustez les ports dans `dev.mk`
- Modifiez les configurations Docker dans `docker.mk`
- Personnalisez les commandes de test dans `test.mk` 