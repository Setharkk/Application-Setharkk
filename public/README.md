# Application Backend

## Description

Backend de l'application avec API REST et gestion de chat.

## Installation

```bash
cd app/backend
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
PORT=3000
NODE_ENV=development
```

## Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## Documentation API

### API Chat

L'API Chat permet de gérer les conversations, le contexte et l'historique des messages.
Pour plus de détails, consultez la [documentation complète de l'API Chat](docs/API_CHAT.md).

Routes principales :
- `POST /api/chat/message` - Envoyer un message
- `GET /api/chat/context` - Obtenir le contexte
- `POST /api/chat/context/update` - Mettre à jour le contexte
- `GET /api/chat/history` - Obtenir l'historique

## Tests

```bash
npm test
```

## Structure du projet

```
app/backend/
├── src/
│   ├── controllers/     # Contrôleurs
│   ├── services/        # Services métier
│   ├── routes/          # Routes API
│   ├── middleware/      # Middleware Express
│   ├── config/          # Configuration
│   └── types/          # Types TypeScript
├── docs/               # Documentation
└── tests/             # Tests
```
