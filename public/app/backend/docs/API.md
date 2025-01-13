# Documentation API Setharkk

## Points de terminaison de l'Assistant

### POST /api/assistant/execute
Exécute une commande sur l'assistant.
```json
{
    "command": "memory|module|system",
    "params": {
        // Paramètres spécifiques à la commande
    }
}
```

### GET /api/assistant/status
Récupère l'état global de l'assistant.

## Points de terminaison du Chat

### POST /api/chat/message
Envoie un message au chat.
```json
{
    "message": "string",
    "context": {}
}
```

### GET /api/chat/context
Récupère le contexte actuel du chat.

### POST /api/chat/context/update
Met à jour le contexte du chat.

### GET /api/chat/history
Récupère l'historique des messages.

## Points de terminaison de la Mémoire

### POST /api/memory/update
Met à jour la mémoire avec de nouvelles données.
```json
{
    "data": {
        // Données à mémoriser
    }
}
```

### GET /api/memory/context
Récupère le contexte de la mémoire.

### GET /api/memory/state
Récupère l'état complet de la mémoire.

### POST /api/memory/learn
Démarre l'apprentissage d'un nouveau pattern.

### GET /api/memory/learning/status
Récupère le statut de l'apprentissage.

## Points de terminaison des Modules

### GET /api/modules
Liste tous les modules disponibles.

### POST /api/modules/:moduleId/action/:action
Exécute une action sur un module spécifique.
```json
{
    "params": {
        // Paramètres de l'action
    }
}
```

### POST /api/modules/:moduleId/load
Charge un module.
```json
{
    "config": {
        // Configuration du module
    }
}
```

### POST /api/modules/:moduleId/unload
Décharge un module.

## Points de terminaison du Système

### POST /api/system/command
Exécute une commande système.
```json
{
    "command": "string",
    "params": {
        // Paramètres de la commande
    }
}
```

### GET /api/system/status
Récupère l'état du système.

### POST /api/system/diagnostic
Lance un diagnostic système.

### GET /api/system/diagnostic/results
Récupère les résultats du diagnostic.

### POST /api/system/optimize
Optimise le système.

### POST /api/system/backup
Crée une sauvegarde.

### POST /api/system/restore
Restaure une sauvegarde.

## Codes d'erreur

- 400: Requête invalide
- 401: Non autorisé
- 403: Accès refusé
- 404: Ressource non trouvée
- 409: Conflit
- 500: Erreur serveur interne

## Format des réponses

Toutes les réponses suivent le format suivant :
```json
{
    "success": true|false,
    "data": {},
    "error": "Message d'erreur (si success=false)"
}
``` 