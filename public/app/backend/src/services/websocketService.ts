import { WebSocketServer, getWebSocketServer } from '../config/websocket';
import { WebSocketUser } from '../types/websocket';
import logger from './logger';

class WebSocketService {
    private connectedUsers: Map<string, WebSocketUser>;

    constructor() {
        this.connectedUsers = new Map();
    }

    public addUser(user: WebSocketUser): void {
        this.connectedUsers.set(user.userId, {
            ...user,
            isOnline: true,
            lastSeen: new Date()
        });

        this.broadcastUserStatus(user.userId, true);
    }

    public removeUser(userId: string): void {
        const user = this.connectedUsers.get(userId);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            this.connectedUsers.set(userId, user);
            this.broadcastUserStatus(userId, false);
        }
    }

    public getOnlineUsers(): WebSocketUser[] {
        return Array.from(this.connectedUsers.values())
            .filter(user => user.isOnline);
    }

    public isUserOnline(userId: string): boolean {
        const user = this.connectedUsers.get(userId);
        return user?.isOnline || false;
    }

    public broadcastMessage(event: string, data: any): void {
        try {
            const wsServer = getWebSocketServer();
            wsServer.broadcastMessage(event, data);
        } catch (error) {
            logger.error('Erreur lors de la diffusion du message:', error);
        }
    }

    public sendToUser(userId: string, event: string, data: any): void {
        try {
            const wsServer = getWebSocketServer();
            wsServer.sendToUser(userId, event, data);
        } catch (error) {
            logger.error(`Erreur lors de l'envoi du message à l'utilisateur ${userId}:`, error);
        }
    }

    private broadcastUserStatus(userId: string, isOnline: boolean): void {
        const user = this.connectedUsers.get(userId);
        if (user) {
            this.broadcastMessage('userStatus', {
                userId: user.userId,
                username: user.username,
                isOnline,
                lastSeen: user.lastSeen
            });
        }
    }

    public getUserStatus(userId: string): Partial<WebSocketUser> | null {
        const user = this.connectedUsers.get(userId);
        if (!user) return null;

        return {
            userId: user.userId,
            username: user.username,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen
        };
    }
}

export const websocketService = new WebSocketService(); 