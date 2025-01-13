# Service Marketing

Ce service gère les fonctionnalités marketing de l'application, notamment :
- Gestion des newsletters
- Suivi des événements marketing
- Campagnes email

## Configuration requise

- Node.js 18+
- Redis
- RabbitMQ
- Mailchimp API Key
- Segment Write Key

## Variables d'environnement

```env
REDIS_URL=redis://redis:6379
MAILCHIMP_API_KEY=votre_clé_api_mailchimp
SEGMENT_WRITE_KEY=votre_clé_segment
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## API Endpoints

### Santé du service
- GET /health

### Newsletter
- POST /newsletter/subscribe
  ```json
  {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

### Suivi des événements
- POST /track
  ```json
  {
    "userId": "123",
    "event": "page_view",
    "properties": {
      "page": "home"
    }
  }
  ```

### Campagnes email
- POST /campaign/email
  ```json
  {
    "subject": "Nouvelle campagne",
    "content": "Contenu de l'email",
    "recipients": ["user@example.com"]
  }
  ``` 