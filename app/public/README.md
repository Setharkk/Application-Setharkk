# Application Setharkk

Application web moderne avec backend Node.js/Express et frontend React.

## Structure du projet

```
app/
├── backend/                 # Code serveur
│   ├── controllers/        # Contrôleurs de l'API
│   ├── middleware/         # Middleware Express
│   ├── models/            # Modèles de données
│   ├── routes/            # Routes API
│   ├── services/          # Services métier
│   └── server.js          # Point d'entrée du serveur
│
├── frontend/               # Application React
│   ├── public/            # Fichiers statiques
│   └── src/
│       ├── components/    # Composants React
│       ├── hooks/         # Hooks personnalisés
│       ├── services/      # Services frontend
│       ├── styles/        # Styles et thèmes
│       ├── utils/         # Utilitaires
│       └── App.jsx        # Composant racine
│
├── shared/                 # Code partagé frontend/backend
│   ├── constants/         # Constantes
│   ├── types/            # Types et interfaces
│   └── utils/            # Utilitaires partagés
│
├── database/              # Scripts et migrations BD
│   ├── migrations/       # Migrations de base de données
│   └── seeds/           # Données de test
│
├── docker/                # Configuration Docker
│   ├── nginx/           # Configuration NGINX
│   └── scripts/         # Scripts Docker
│
├── tests/                 # Tests
│   ├── unit/            # Tests unitaires
│   ├── integration/     # Tests d'intégration
│   └── e2e/            # Tests end-to-end
│
├── scripts/               # Scripts utilitaires
├── config/               # Fichiers de configuration
├── logs/                 # Logs applicatifs
└── .env                  # Variables d'environnement
```

## Installation

1. Cloner le dépôt :
```bash
git clone [url-du-repo]
cd Application\ Setharkk
```

2. Installer les dépendances :
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

## Développement

En développement :
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## Production

Build et démarrage :
```bash
# Build frontend
cd frontend
npm run build

# Démarrer l'application
cd ..
docker-compose up -d
```

## Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests end-to-end
npm run test:e2e
```

## Documentation

- `/backend/README.md` - Documentation backend
- `/frontend/README.md` - Documentation frontend
- `/docs` - Documentation détaillée

## Licence

Propriétaire - Tous droits réservés
