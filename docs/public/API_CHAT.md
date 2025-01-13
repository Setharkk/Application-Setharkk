# Documentation API Chat

## Vue d'ensemble

L'API Chat fournit des endpoints pour gérer les conversations, le contexte et l'historique des messages.

## Base URL

```
http://localhost:3000/api/chat
```

## Endpoints

### Envoyer un message

**Endpoint:** `POST /message`

Envoie un nouveau message dans la conversation.

**Corps de la requête:**
```json
{
    "message": "string",
    "context": {
        "key": "value"
    }
}
```

**Paramètres:**
- `message` (obligatoire): Le contenu du message
- `context` (optionnel): Un objet contenant des données contextuelles

**Réponse:**
```json
{
    "success": true,
    "data": {
        "id": "string",
        "message": "string",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "context": {
            "key": "value"
        }
    }
}
```

### Obtenir le contexte

**Endpoint:** `GET /context`

Récupère le contexte actuel de la conversation.

**Réponse:**
```json
{
    "success": true,
    "data": {
        "context": {
            "id": "string",
            "data": {
                "key": "value"
            },
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

### Mettre à jour le contexte

**Endpoint:** `POST /context/update`

Met à jour le contexte de la conversation.

**Corps de la requête:**
```json
{
    "context": {
        "key": "value"
    }
}
```

**Réponse:**
```json
{
    "success": true,
    "data": {
        "context": {
            "id": "string",
            "data": {
                "key": "value"
            },
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

### Obtenir l'historique

**Endpoint:** `GET /history`

Récupère l'historique des messages avec pagination.

**Paramètres de requête:**
- `page` (optionnel): Numéro de la page (défaut: 1)
- `pageSize` (optionnel): Nombre de messages par page (défaut: 20, max: 100)

**Réponse:**
```json
{
    "success": true,
    "data": {
        "messages": [
            {
                "id": "string",
                "message": "string",
                "timestamp": "2024-01-01T00:00:00.000Z",
                "context": {
                    "key": "value"
                }
            }
        ],
        "total": 100,
        "page": 1,
        "totalPages": 5,
        "hasMore": true
    }
}
```

### Rechercher des messages

**Endpoint:** `GET /search`

Recherche des messages dans l'historique avec pagination et filtres de date.

**Paramètres de requête:**
- `query` (obligatoire): Terme de recherche
- `page` (optionnel): Numéro de la page (défaut: 1)
- `pageSize` (optionnel): Nombre de messages par page (défaut: 20, max: 100)
- `startDate` (optionnel): Date de début au format ISO 8601 (ex: 2024-01-01T00:00:00Z)
- `endDate` (optionnel): Date de fin au format ISO 8601 (ex: 2024-01-31T23:59:59Z)

**Réponse:**
```json
{
    "success": true,
    "data": {
        "messages": [
            {
                "id": "string",
                "message": "string",
                "timestamp": "2024-01-01T00:00:00.000Z",
                "context": {
                    "key": "value"
                }
            }
        ],
        "total": 50,
        "page": 1,
        "totalPages": 3,
        "hasMore": true
    }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200  | Succès |
| 400  | Requête invalide |
| 500  | Erreur serveur |

## Types de données

### ChatMessage
```typescript
{
    id: string;
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
}
```

### ChatContext
```typescript
{
    id: string;
    data: Record<string, any>;
    updatedAt: Date;
}
```

### PaginatedMessages
```typescript
{
    messages: ChatMessage[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}
```

### SearchOptions
```typescript
{
    query: string;
    page?: number;
    pageSize?: number;
    startDate?: Date;
    endDate?: Date;
}
```

## Exemples d'utilisation

### Envoyer un message
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour !",
    "context": {
      "userId": "123"
    }
  }'
```

### Obtenir le contexte
```bash
curl http://localhost:3000/api/chat/context
```

### Mettre à jour le contexte
```bash
curl -X POST http://localhost:3000/api/chat/context/update \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "userId": "123",
      "preferences": {
        "language": "fr"
      }
    }
  }'
```

### Obtenir l'historique (avec pagination)
```bash
# Page 1 avec 20 messages par page
curl http://localhost:3000/api/chat/history?page=1&pageSize=20

# Page 2 avec 50 messages par page
curl http://localhost:3000/api/chat/history?page=2&pageSize=50
```

### Rechercher des messages
```bash
# Recherche simple
curl http://localhost:3000/api/chat/search?query=bonjour

# Recherche avec pagination et filtres de date
curl http://localhost:3000/api/chat/search?query=bonjour&page=1&pageSize=20&startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
``` 