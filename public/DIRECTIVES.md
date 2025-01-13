# Directives de l'Application Setharkk

## 1. Structure Hiérarchique

### Niveau 1 : Core (Noyau)
- Point d'entrée principal de l'application
- Contient le chat interactif central
- Gère la mémoire et l'orchestration
- DOIT être le premier composant initialisé

### Niveau 2 : Infrastructure
- Fournit les services essentiels
- Gère la communication entre les composants
- DOIT être initialisée après le Core

### Niveau 3 : Modules
- Modules fonctionnels indépendants
- Chaque module DOIT implémenter l'interface IModule
- DOIVENT être chargés dynamiquement

### Niveau 4 : Extension
- Extension navigateur
- DOIT communiquer via le Core
- DOIT respecter les règles de sécurité

## 2. Règles de Communication

### Chat Interactif
- Point central de communication
- DOIT être notifié de toutes les actions
- DOIT maintenir le contexte global

### Système de Mémoire
- DOIT enregistrer toutes les interactions
- DOIT être consulté avant chaque action
- DOIT optimiser l'apprentissage

### Modules
- DOIVENT communiquer via l'orchestrateur
- NE DOIVENT PAS communiquer directement entre eux
- DOIVENT être autonomes

## 3. Gestion des Données

### Stockage
- Données sensibles DOIVENT être chiffrées
- Chaque module DOIT gérer son propre cache
- Synchronisation DOIT être atomique

### Mémoire
- Apprentissage DOIT être continu
- Patterns DOIVENT être analysés
- Contexte DOIT être maintenu

## 4. Développement

### Code
- DOIT suivre les standards TypeScript
- DOIT être documenté
- DOIT inclure des tests

### Modules
- DOIVENT être testables individuellement
- DOIVENT gérer leurs propres erreurs
- DOIVENT être versionnés

## 5. Sécurité

### Authentification
- DOIT être centralisée
- DOIT utiliser des tokens JWT
- DOIT gérer les sessions

### Données
- DOIVENT être validées
- DOIVENT être nettoyées
- DOIVENT être sauvegardées

## 6. Performance

### Optimisation
- Lazy loading DOIT être utilisé
- Caching DOIT être implémenté
- Requêtes DOIVENT être optimisées

### Monitoring
- Performances DOIVENT être mesurées
- Erreurs DOIVENT être tracées
- Utilisation DOIT être analysée

## 7. Maintenance

### Mises à jour
- DOIVENT être automatisées
- DOIVENT être réversibles
- DOIVENT être testées

### Documentation
- DOIT être maintenue à jour
- DOIT inclure des exemples
- DOIT être claire et concise 

## 8. Préservation des Données

### Modifications
- AUCUNE suppression sans autorisation explicite de l'utilisateur
- DOIT conserver tout le travail existant
- DOIT vérifier la compatibilité avant modification

### Versioning
- DOIT maintenir un historique des modifications
- DOIT créer une sauvegarde avant modification
- DOIT pouvoir restaurer l'état précédent

### Compatibilité
- DOIT vérifier l'impact sur l'existant
- DOIT maintenir les fonctionnalités actuelles
- DOIT assurer la cohérence du système 

## 9. Intégration Continue

### Routes et Chemins d'Accès
- DOIVENT être définis immédiatement après chaque implémentation
- DOIVENT être documentés dans le fichier de routes principal
- DOIVENT suivre la structure hiérarchique du système

### API Endpoints
- DOIVENT être créés pour chaque nouvelle fonctionnalité
- DOIVENT être versionnés (ex: /api/v1/...)
- DOIVENT être testés avant intégration

### Connexions Inter-Services
- DOIVENT être établies immédiatement après l'implémentation
- DOIVENT être validées par des tests d'intégration
- DOIVENT être documentées dans le schéma global

### Documentation des Chemins
- DOIT être mise à jour à chaque nouvelle implémentation
- DOIT inclure des exemples d'utilisation
- DOIT spécifier les dépendances et connexions

### Validation
- Tester les routes avec Postman/Swagger
- Vérifier les connexions WebSocket
- Valider les permissions d'accès 

## 10. Documentation du Développement

### Journal d'Implémentation
- DOIT documenter chaque étape d'implémentation
- DOIT inclure les décisions techniques prises
- DOIT expliquer les choix d'architecture

### Correction d'Erreurs
- DOIT être effectuée immédiatement après détection
- DOIT être documentée avec :
  - Description du problème
  - Solution appliquée
  - Tests de validation

### Historique des Modifications
- DOIT être maintenu dans CHANGELOG.md
- DOIT inclure :
  - Date de modification
  - Composant modifié
  - Nature du changement
  - Tests effectués

### Documentation Technique
- DOIT être créée pour chaque composant
- DOIT inclure :
  - Architecture détaillée
  - Dépendances
  - Points d'intégration
  - Exemples d'utilisation

### Résolution de Problèmes
- DOIT maintenir un registre des problèmes rencontrés
- DOIT documenter les solutions appliquées
- DOIT inclure les leçons apprises

### Références
- DOIT maintenir une liste des ressources utilisées
- DOIT documenter les versions des dépendances
- DOIT inclure les liens vers la documentation externe 