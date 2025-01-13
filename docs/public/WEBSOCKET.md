# Documentation WebSocket

## Vue d'ensemble

Le serveur WebSocket permet une communication en temps réel entre le client et le serveur pour les fonctionnalités de chat.

## Connexion

```javascript
const socket = io('http://localhost:3000', {
    auth: {
        token: 'votre-token-jwt'
    }
});
```

## Événements

### Client vers Serveur

#### Envoi d'un message
```javascript
socket.emit('message', {
    message: 'Votre message',
    context: {
        // Données contextuelles optionnelles
        roomId: '123',
        replyTo: 'message-id'
    }
});
```

#### Indication de saisie
```javascript
socket.emit('typing', true);  // Début de saisie
socket.emit('typing', false); // Fin de saisie
```

### Serveur vers Client

#### Réception d'un message
```javascript
socket.on('message', (message) => {
    console.log('Nouveau message:', message);
    // {
    //     id: string;
    //     message: string;
    //     timestamp: string;
    //     context?: Record<string, any>;
    // }
});
```

#### Notification de saisie
```javascript
socket.on('userTyping', (data) => {
    console.log('Utilisateur en train d\'écrire:', data);
    // {
    //     userId: string;
    //     username: string;
    //     isTyping: boolean;
    // }
});
```

#### Statut des utilisateurs
```javascript
socket.on('userStatus', (status) => {
    console.log('Statut utilisateur mis à jour:', status);
    // {
    //     userId: string;
    //     username: string;
    //     isOnline: boolean;
    //     lastSeen?: string;
    // }
});
```

#### Erreurs
```javascript
socket.on('error', (error) => {
    console.error('Erreur:', error);
    // {
    //     message: string;
    // }
});
```

## Gestion des erreurs

### Reconnexion automatique
```javascript
socket.io.on('reconnect_attempt', () => {
    console.log('Tentative de reconnexion...');
});

socket.io.on('reconnect', () => {
    console.log('Reconnecté au serveur');
});

socket.io.on('reconnect_error', (error) => {
    console.error('Erreur de reconnexion:', error);
});
```

### Déconnexion
```javascript
socket.on('disconnect', (reason) => {
    console.log('Déconnecté du serveur:', reason);
});
```

## Exemple d'utilisation complet

```javascript
import { io } from 'socket.io-client';

class ChatClient {
    constructor(url, token) {
        this.socket = io(url, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Connexion
        this.socket.on('connect', () => {
            console.log('Connecté au serveur');
        });

        // Messages
        this.socket.on('message', (message) => {
            console.log('Nouveau message:', message);
        });

        // Saisie
        this.socket.on('userTyping', (data) => {
            console.log('Utilisateur en train d\'écrire:', data);
        });

        // Statut
        this.socket.on('userStatus', (status) => {
            console.log('Statut utilisateur:', status);
        });

        // Erreurs
        this.socket.on('error', (error) => {
            console.error('Erreur:', error);
        });
    }

    sendMessage(message, context = {}) {
        this.socket.emit('message', { message, context });
    }

    setTyping(isTyping) {
        this.socket.emit('typing', isTyping);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

// Utilisation
const chat = new ChatClient('http://localhost:3000', 'votre-token-jwt');

// Envoi d'un message
chat.sendMessage('Bonjour !', { roomId: '123' });

// Indication de saisie
chat.setTyping(true);
setTimeout(() => chat.setTyping(false), 1000);
```

## Notes de sécurité

1. **Authentification** : Toujours utiliser un token JWT valide pour la connexion.
2. **Validation** : Valider toutes les données côté client et serveur.
3. **Rate Limiting** : Le serveur implémente des limites de taux pour éviter les abus.
4. **Timeout** : Les connexions inactives seront automatiquement fermées après un délai.

## Bonnes pratiques

1. Toujours gérer les erreurs et les déconnexions.
2. Implémenter une logique de reconnexion.
3. Valider les données avant l'envoi.
4. Utiliser les événements de typage pour une meilleure expérience utilisateur.
5. Nettoyer les écouteurs d'événements lors de la déconnexion. 