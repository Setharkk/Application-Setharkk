import { IService, ServiceType, ServiceStatus } from '../orchestrator';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

interface IChatInteractive extends IService {
    sendMessage(message: ChatMessage): Promise<ChatResponse>;
    registerHandler(handler: ChatCommandHandler): void;
    getContext(): Promise<ChatContext>;
}

interface ChatMessage {
    content: string;
    type: MessageType;
    context?: ChatContext;
    metadata?: Record<string, any>;
}

interface ChatResponse {
    content: string;
    status: ResponseStatus;
    context: ChatContext;
    actions?: ChatAction[];
}

interface ChatContext {
    sessionId: string;
    userId: string;
    timestamp: Date;
    history: ChatMessage[];
    state: Record<string, any>;
}

interface ChatCommandHandler {
    canHandle(message: ChatMessage): boolean;
    handle(message: ChatMessage, context: ChatContext): Promise<ChatResponse>;
}

enum MessageType {
    COMMAND = 'COMMAND',
    QUERY = 'QUERY',
    RESPONSE = 'RESPONSE',
    NOTIFICATION = 'NOTIFICATION'
}

enum ResponseStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    PENDING = 'PENDING'
}

interface ChatAction {
    type: string;
    payload: any;
    target: string;
}

class InteractiveChat implements IChatInteractive {
    public id: string = 'interactive-chat';
    public name: string = 'Interactive Chat';
    public type: ServiceType = ServiceType.CHAT;
    public status: ServiceStatus = ServiceStatus.STOPPED;
    public dependencies: string[] = ['memory-system'];

    private cache: Redis;
    private handlers: ChatCommandHandler[] = [];
    private eventEmitter: EventEmitter;

    constructor(cache: Redis) {
        this.cache = cache;
        this.eventEmitter = new EventEmitter();
    }

    async initialize(): Promise<void> {
        this.status = ServiceStatus.INITIALIZING;
        
        // Initialisation du cache
        await this.setupCache();
        
        // Configuration des événements
        this.setupEventListeners();
        
        this.status = ServiceStatus.RUNNING;
    }

    async terminate(): Promise<void> {
        this.status = ServiceStatus.STOPPED;
        this.eventEmitter.removeAllListeners();
    }

    async sendMessage(message: ChatMessage): Promise<ChatResponse> {
        try {
            // Validation du message
            this.validateMessage(message);

            // Récupération ou création du contexte
            const context = await this.getOrCreateContext(message);

            // Recherche du handler approprié
            const handler = this.findHandler(message);
            if (!handler) {
                return this.createErrorResponse('Aucun handler trouvé pour ce message', context);
            }

            // Traitement du message
            const response = await handler.handle(message, context);
            
            // Mise à jour du contexte
            await this.updateContext(context, message, response);
            
            // Émission d'événements
            this.eventEmitter.emit('message:processed', { message, response, context });
            
            return response;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
            return this.createErrorResponse(errorMessage, await this.getOrCreateContext(message));
        }
    }

    registerHandler(handler: ChatCommandHandler): void {
        this.handlers.push(handler);
    }

    async getContext(): Promise<ChatContext> {
        const sessionId = 'current-session'; // À remplacer par une vraie gestion de session
        return this.loadContext(sessionId);
    }

    private async setupCache(): Promise<void> {
        await this.cache.config('SET', 'notify-keyspace-events', 'Ex');
    }

    private setupEventListeners(): void {
        this.eventEmitter.on('message:received', this.handleMessageReceived.bind(this));
        this.eventEmitter.on('context:updated', this.handleContextUpdated.bind(this));
    }

    private validateMessage(message: ChatMessage): void {
        if (!message.content) {
            throw new Error('Le contenu du message est requis');
        }
        if (!message.type) {
            throw new Error('Le type de message est requis');
        }
    }

    private async getOrCreateContext(message: ChatMessage): Promise<ChatContext> {
        if (message.context) {
            return message.context;
        }
        return {
            sessionId: 'new-session', // À remplacer par une vraie génération
            userId: 'current-user',   // À remplacer par l'utilisateur réel
            timestamp: new Date(),
            history: [],
            state: {}
        };
    }

    private findHandler(message: ChatMessage): ChatCommandHandler | undefined {
        return this.handlers.find(handler => handler.canHandle(message));
    }

    private async updateContext(
        context: ChatContext,
        message: ChatMessage,
        response: ChatResponse
    ): Promise<void> {
        context.history.push(message);
        context.timestamp = new Date();
        await this.saveContext(context);
    }

    private async loadContext(sessionId: string): Promise<ChatContext> {
        const cached = await this.cache.get(`chat:context:${sessionId}`);
        if (cached) {
            return JSON.parse(cached);
        }
        return this.createNewContext(sessionId);
    }

    private async saveContext(context: ChatContext): Promise<void> {
        await this.cache.set(
            `chat:context:${context.sessionId}`,
            JSON.stringify(context)
        );
    }

    private createNewContext(sessionId: string): ChatContext {
        return {
            sessionId,
            userId: 'current-user', // À remplacer par l'utilisateur réel
            timestamp: new Date(),
            history: [],
            state: {}
        };
    }

    private createErrorResponse(message: string, context: ChatContext): ChatResponse {
        return {
            content: message,
            status: ResponseStatus.ERROR,
            context
        };
    }

    private async handleMessageReceived(data: { message: ChatMessage }): Promise<void> {
        // Traitement des messages reçus
        this.eventEmitter.emit('message:processing', data);
    }

    private async handleContextUpdated(data: { context: ChatContext }): Promise<void> {
        // Mise à jour du contexte
        await this.saveContext(data.context);
    }
}

export {
    IChatInteractive,
    ChatMessage,
    ChatResponse,
    ChatContext,
    ChatCommandHandler,
    MessageType,
    ResponseStatus,
    ChatAction,
    InteractiveChat
}; 