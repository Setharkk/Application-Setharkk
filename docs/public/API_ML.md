# API Machine Learning

Cette documentation décrit les endpoints disponibles pour les fonctionnalités d'analyse et de traitement ML.

## Endpoints

### Analyser un texte
```http
POST /api/ml/analyze
```

Analyse un texte pour en extraire l'intention, le sentiment et les entités.

#### Requête
```json
{
    "text": "Je suis très content de ce nouveau produit !"
}
```

#### Réponse
```json
{
    "intent": "feedback",
    "confidence": 0.8,
    "entities": {},
    "sentiment": {
        "score": 0.8,
        "label": "positive"
    }
}
```

### Générer un résumé
```http
POST /api/ml/summarize
```

Génère un résumé d'un texte donné.

#### Requête
```json
{
    "text": "Long texte à résumer...",
    "maxLength": 100 // Optionnel, nombre de mots maximum
}
```

#### Réponse
```json
{
    "summary": "Résumé généré du texte..."
}
```

### Classifier un contenu
```http
POST /api/ml/classify
```

Classifie un texte selon des catégories données.

#### Requête
```json
{
    "text": "Texte à classifier",
    "categories": ["technologie", "sport", "culture"]
}
```

#### Réponse
```json
{
    "classification": [
        {
            "category": "technologie",
            "confidence": 0.85,
            "subcategories": [
                {
                    "name": "intelligence artificielle",
                    "confidence": 0.75
                }
            ]
        }
    ]
}
```

### Extraire les entités
```http
POST /api/ml/entities
```

Extrait les entités nommées d'un texte.

#### Requête
```json
{
    "text": "Apple a annoncé son nouveau produit à Paris le 15/09/2023."
}
```

#### Réponse
```json
{
    "entities": {
        "organizations": ["Apple"],
        "locations": ["Paris"],
        "dates": ["15/09/2023"],
        "products": ["nouveau produit"]
    }
}
```

### Générer une réponse
```http
POST /api/ml/generate
```

Génère une réponse basée sur un prompt donné.

#### Requête
```json
{
    "prompt": "Explique-moi comment fonctionne l'intelligence artificielle",
    "context": {
        "niveau": "débutant",
        "langue": "français"
    },
    "options": {
        "temperature": 0.7,
        "maxTokens": 150,
        "topP": 0.9
    }
}
```

#### Réponse
```json
{
    "response": "L'intelligence artificielle est un domaine..."
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Requête invalide (paramètres manquants ou invalides) |
| 401  | Non autorisé |
| 403  | Accès refusé |
| 500  | Erreur serveur |

## Notes
- Tous les endpoints nécessitent une authentification via token JWT
- Les réponses sont modérées automatiquement
- Les limites de rate limiting s'appliquent à tous les endpoints 