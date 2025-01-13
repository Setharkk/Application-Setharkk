import { ChatMessage } from '../services/chatService';

export interface WebSocketEvents {
    // Événements client -> serveur
    message: (data: { message: string; context?: Record<string, any> }) => void;
    typing: (isTyping: boolean) => void;
    
    // Événements serveur -> client
    messageReceived: (message: ChatMessage) => void;
    userTyping: (data: { userId: string; username: string; isTyping: boolean }) => void;
    error: (data: { message: string }) => void;
}

export interface WebSocketAuthData {
    token: string;
}

export interface WebSocketUser {
    userId: string;
    username: string;
    isOnline: boolean;
    lastSeen?: Date;
} 