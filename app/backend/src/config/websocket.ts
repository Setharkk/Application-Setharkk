import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../services/logger';
import { chatService } from '../services/chatService';

interface ChatSocket extends Socket {
    userId?: string;
    username?: string;
}

export class WebSocketServer {
    private io: Server;

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });

        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware() {
        this.io.use(async (socket: ChatSocket, next) => {
            try {
                // TODO: Implémenter l'authentification du token
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }

                // Pour l'instant, on utilise des valeurs de test
                socket.userId = 'test-user-id';
                socket.username = 'test-user';
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: ChatSocket) => {
            logger.info(`Client connecté: ${socket.id} (${socket.username})`);

            // Gérer la réception des messages
            socket.on('message', async (data: { message: string; context?: Record<string, any> }) => {
                try {
                    const message = await chatService.sendMessage(data.message, {
                        ...data.context,
                        userId: socket.userId,
                        username: socket.username
                    });

                    // Émettre le message à tous les clients
                    this.io.emit('message', message);
                } catch (error) {
                    logger.error('Erreur lors de l\'envoi du message:', error);
                    socket.emit('error', {
                        message: 'Erreur lors de l\'envoi du message'
                    });
                }
            });

            // Gérer la saisie en cours
            socket.on('typing', (isTyping: boolean) => {
                socket.broadcast.emit('userTyping', {
                    userId: socket.userId,
                    username: socket.username,
                    isTyping
                });
            });

            // Gérer la déconnexion
            socket.on('disconnect', () => {
                logger.info(`Client déconnecté: ${socket.id} (${socket.username})`);
            });

            // Gérer les erreurs
            socket.on('error', (error) => {
                logger.error('Erreur WebSocket:', error);
            });
        });
    }

    // Méthodes publiques pour émettre des événements
    public broadcastMessage(event: string, data: any) {
        this.io.emit(event, data);
    }

    public sendToUser(userId: string, event: string, data: any) {
        const sockets = Array.from(this.io.sockets.sockets.values()) as ChatSocket[];
        const userSocket = sockets.find(socket => socket.userId === userId);
        if (userSocket) {
            userSocket.emit(event, data);
        }
    }
}

let wsServer: WebSocketServer;

export const initializeWebSocket = (server: HttpServer): WebSocketServer => {
    if (!wsServer) {
        wsServer = new WebSocketServer(server);
    }
    return wsServer;
};

export const getWebSocketServer = (): WebSocketServer => {
    if (!wsServer) {
        throw new Error('WebSocket server not initialized');
    }
    return wsServer;
}; 