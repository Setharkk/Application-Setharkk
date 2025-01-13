# API Assistant

## Routes

### Chat

#### POST /chat
Envoie un message à l'assistant et reçoit une réponse.

**Requête**
```json
{
  "message": "string",
  "context": {
    "key": "value"
  }
}
```

**Réponse**
```json
{
  "response": "string",
  "analysis": {
    "intent": "string",
    "sentiment": {
      "score": number,
      "label": "positive" | "negative" | "neutral"
    },
    "entities": {}
  }
}
```

#### POST /stream
Envoie un message et reçoit une réponse en streaming.

**Requête**
```json
{
  "message": "string",
  "context": {
    "key": "value"
  }
}
```

**Réponse**
Stream de données SSE (Server-Sent Events)

### Contexte

#### GET /context
Récupère le contexte actuel.

**Réponse**
```json
{
  "context": {
    "key": "value"
  }
}
```

#### POST /context
Met à jour le contexte.

**Requête**
```json
{
  "context": {
    "key": "value"
  }
}
```

#### DELETE /context
Efface le contexte actuel.

### Historique

#### GET /history
Récupère l'historique des messages.

**Paramètres de requête**
- page (number, optionnel): Numéro de page
- pageSize (number, optionnel): Taille de la page

**Réponse**
```json
{
  "messages": [
    {
      "message": "string",
      "timestamp": "string",
      "analysis": {}
    }
  ],
  "totalCount": number,
  "currentPage": number,
  "totalPages": number,
  "hasMore": boolean
}
```

#### DELETE /history
Efface l'historique des messages.

### Paramètres

#### GET /settings
Récupère les paramètres de l'assistant.

**Réponse**
```json
{
  "language": "string",
  "model": "string",
  "temperature": number,
  "maxTokens": number
}
```

#### PUT /settings
Met à jour les paramètres de l'assistant.

**Requête**
```json
{
  "language": "string",
  "model": "string",
  "temperature": number,
  "maxTokens": number
}
```

### Analyse

#### POST /analyze
Analyse un message.

**Requête**
```json
{
  "message": "string"
}
```

**Réponse**
```json
{
  "intent": "string",
  "sentiment": {
    "score": number,
    "label": "string"
  },
  "entities": {},
  "suggestions": ["string"]
}
```

## Authentification

Toutes les routes nécessitent un token JWT valide dans l'en-tête Authorization :
```
Authorization: Bearer <token>
```

## Gestion des erreurs

Les erreurs sont retournées au format suivant :
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

Codes d'erreur communs :
- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 429: Trop de requêtes
- 500: Erreur serveur 