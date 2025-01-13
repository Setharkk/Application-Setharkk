# Assistant Backend avec Apprentissage

Backend intelligent pour l'assistant avec capacités d'apprentissage et d'adaptation.

## Fonctionnalités

- 🤖 Assistant conversationnel intelligent
- 📚 Système d'apprentissage automatique
- 🔄 Adaptation continue basée sur les feedbacks
- 🔒 Authentification JWT
- 📊 Monitoring des performances
- 💾 Persistence MongoDB
- 🚀 Cache optimisé
- 🔍 Analyse de patterns

## Prérequis

- Node.js >= 14
- MongoDB >= 4.4
- npm ou yarn

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd app/backend
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

4. Lancer en développement :
```bash
npm run dev
```

## Structure du Projet

```
src/
├── config/         # Configuration
├── controllers/    # Contrôleurs
├── events/         # Système d'événements
├── middleware/     # Middlewares
├── models/         # Modèles Mongoose
├── routes/         # Routes API
├── services/       # Services métier
└── types/         # Types TypeScript
```

## API Routes

### Assistant Routes (`/api/v1/assistant`)

- POST `/chat` - Envoyer un message
- GET `/context` - Obtenir le contexte
- DELETE `/context` - Effacer le contexte
- GET `/history` - Obtenir l'historique
- DELETE `/history` - Effacer l'historique

### Learning Routes (`/api/v1/learning`)

- POST `/feedback` - Soumettre un feedback
- GET `/status` - Obtenir le statut d'apprentissage
- POST `/optimize` - Optimiser les patterns
- POST `/patterns` - Obtenir les patterns pertinents

## Système d'Apprentissage

Le système d'apprentissage utilise plusieurs composants :

1. **Pattern Detection**
   - Analyse des messages
   - Extraction des intentions
   - Identification des entités

2. **Feedback Processing**
   - Évaluation des réponses
   - Mise à jour des patterns
   - Optimisation continue

3. **Quality Assessment**
   - Cohérence des réponses
   - Pertinence du contenu
   - Structure des messages

## Sécurité

- Authentification JWT
- Validation des entrées
- Protection CORS
- Headers sécurisés (Helmet)
- Rate Limiting

## Monitoring

- Métriques de performance
- Logs structurés
- Traçage des erreurs
- Statistiques d'apprentissage

## Tests

```bash
# Exécuter les tests
npm test

# Avec couverture
npm test -- --coverage
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## License

MIT 