import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import { AppError } from '../../errors/appError';
import logger from '../logger';
import { MLService } from '../ml';

type ContextValue = string | number | boolean | null;

export interface ChatMessage {
    id: string;
    message: string;
    timestamp: Date;
    context?: Record<string, ContextValue>;
    analysis?: {
        sentiment: {
            score: number;
            label: 'positive' | 'negative' | 'neutral';
        };
        entities: string[];
        keywords: string[];
        summary: string;
    };
    suggestions?: string[];
}

export interface ChatContext {
    id: string;
    data: Record<string, ContextValue>;
    updatedAt: Date;
}

export interface PaginatedMessages {
    messages: ChatMessage[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

export interface SearchOptions {
    query: string;
    page?: number;
    pageSize?: number;
    startDate?: Date;
    endDate?: Date;
}

export class ChatService extends BaseService {
    private readonly messages: Map<string, ChatMessage[]>;
    private readonly contexts: Map<string, ChatContext>;
    private readonly mlService: MLService;

    constructor() {
        super(
            {
                id: 'chat',
                name: 'Chat Service',
                type: ServiceType.CORE,
                dependencies: ['ml', 'memory']
            },
            {
                version: '1.0.0',
                description: 'Service de gestion des conversations',
                author: 'Setharkk',
                tags: ['chat', 'messages', 'conversations']
            }
        );
        this.messages = new Map();
        this.contexts = new Map();
        this.mlService = new MLService();
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Initializing Chat service');
        await this.mlService.initialize();
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Shutting down Chat service');
        if (this.mlService) {
            await this.mlService.shutdown();
        }
        this.messages.clear();
        this.contexts.clear();
    }

    public async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
        try {
            const analysis = await this.mlService.analyzeText(message);
            const chatMessage: ChatMessage = {
                id: Math.random().toString(36).substring(2),
                message,
                timestamp: new Date(),
                analysis
            };

            if (!this.messages.has(sessionId)) {
                this.messages.set(sessionId, []);
            }
            this.messages.get(sessionId)?.push(chatMessage);

            return chatMessage;
        } catch (error) {
            logger.error('Erreur lors de l\'envoi du message:', { error: error instanceof Error ? error.message : String(error) });
            throw new AppError('Failed to send message', 500);
        }
    }

    public async getContext(sessionId: string): Promise<ChatContext | undefined> {
        return this.contexts.get(sessionId);
    }

    public async updateContext(sessionId: string, data: Record<string, ContextValue>): Promise<void> {
        const context: ChatContext = {
            id: sessionId,
            data,
            updatedAt: new Date()
        };
        this.contexts.set(sessionId, context);
    }

    public async getHistory(sessionId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedMessages> {
        const messages = this.messages.get(sessionId) || [];
        const total = messages.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return {
            messages: messages.slice(startIndex, endIndex),
            total,
            page,
            totalPages,
            hasMore: page < totalPages
        };
    }

    public async searchMessages(sessionId: string, options: SearchOptions): Promise<PaginatedMessages> {
        const messages = this.messages.get(sessionId) || [];
        const filtered = messages.filter(msg => {
            const matchesQuery = options.query ? 
                msg.message.toLowerCase().includes(options.query.toLowerCase()) : true;
            const afterStartDate = options.startDate ? 
                msg.timestamp >= options.startDate : true;
            const beforeEndDate = options.endDate ? 
                msg.timestamp <= options.endDate : true;
            
            return matchesQuery && afterStartDate && beforeEndDate;
        });

        const page = options.page ?? 1;
        const pageSize = options.pageSize ?? 10;
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return {
            messages: filtered.slice(startIndex, endIndex),
            total,
            page,
            totalPages,
            hasMore: page < totalPages
        };
    }
}

export const chatService = new ChatService(); 