# Documentation API

## Authentification
Toutes les requêtes doivent inclure un token JWT dans l'en-tête :
```
Authorization: Bearer <token>
```

## Endpoints

### Chat API

#### POST /api/chat/message
Envoie un message au système de chat.

**Request Body:**
```json
{
  "message": "string",
  "context": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "text": "string",
    "type": "assistant",
    "timestamp": "ISO-8601",
    "metadata": {}
  }
}
```

#### GET /api/chat/context
Récupère le contexte actuel de la conversation.

**Response:**
```json
{
  "status": "success",
  "data": {
    "sessionId": "uuid",
    "messages": [],
    "metadata": {},
    "lastActivity": "ISO-8601"
  }
}
```

### Memory API

#### POST /api/memory/update
Met à jour la mémoire du système.

**Request Body:**
```json
{
  "data": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "updated": true
  }
}
```

#### GET /api/memory/state
Récupère l'état actuel de la mémoire.

**Response:**
```json
{
  "status": "success",
  "data": {
    "shortTerm": {},
    "longTerm": {},
    "context": {},
    "patterns": []
  }
}
```

### Modules API

#### GET /api/modules
Liste tous les modules disponibles.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "version": "string",
      "status": "active",
      "actions": [],
      "config": {}
    }
  ]
}
```

#### POST /api/modules/:moduleId/action/:action
Exécute une action sur un module spécifique.

**Request Body:**
```json
{
  "params": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "result": "any"
  }
}
```

### System API

#### POST /api/system/command/:command
Exécute une commande système.

**Request Body:**
```json
{
  "params": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "result": "any"
  }
}
```

#### GET /api/system/status
Récupère le statut du système.

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "uptime": 123456,
    "memory": {
      "total": 1000,
      "used": 500,
      "free": 500
    },
    "cpu": {
      "usage": 25,
      "cores": 4
    }
  }
}
```

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide |
| 401  | Non authentifié |
| 403  | Non autorisé |
| 404  | Ressource non trouvée |
| 429  | Trop de requêtes |
| 500  | Erreur serveur |

## Réponses d'Erreur

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Description de l'erreur",
  "errors": {
    "field": ["Message d'erreur"]
  }
}
```

## Pagination

Pour les endpoints qui retournent des listes, utilisez les paramètres de requête :

```
?page=1&limit=10
```

## Rate Limiting

- 100 requêtes par IP par 15 minutes
- Headers de réponse :
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset 