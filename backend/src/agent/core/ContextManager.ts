import { Redis } from 'ioredis';
import { Config } from '../../config/config';
import { Context, ContextEntry, ErrorContext } from './types';

export class ContextManager {
    private readonly redis: Redis;

    constructor(config: Config) {
        this.redis = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
        });
    }

    async getContext(sessionId: string): Promise<Context | null> {
        try {
            const contextStr = await this.redis.get(`context:${sessionId}`);
            if (!contextStr) return null;
            return JSON.parse(contextStr) as Context;
        } catch (error) {
            console.error('Erreur lors de la récupération du contexte:', error);
            return null;
        }
    }

    async updateContext(sessionId: string, entry: ContextEntry, userId?: string): Promise<void> {
        try {
            const existingContext = await this.getContext(sessionId);
            const timestamp = new Date();

            const updatedContext: Context = {
                sessionId,
                userId,
                timestamp,
                history: [...(existingContext?.history || []), entry],
                state: existingContext?.state || {},
                errors: existingContext?.errors || []
            };

            await this.redis.set(
                `context:${sessionId}`,
                JSON.stringify(updatedContext),
                'EX',
                24 * 60 * 60 // 24 heures
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contexte:', error);
            throw error;
        }
    }

    async clearContext(sessionId: string): Promise<void> {
        try {
            await this.redis.del(`context:${sessionId}`);
        } catch (error) {
            console.error('Erreur lors de la suppression du contexte:', error);
            throw error;
        }
    }

    async addError(sessionId: string, error: Error | string): Promise<void> {
        try {
            const context = await this.getContext(sessionId);
            if (!context) {
                throw new Error('Contexte non trouvé');
            }

            const errorContext: ErrorContext = {
                message: typeof error === 'string' ? error : error.message,
                timestamp: new Date(),
                code: error instanceof Error ? error.name : undefined,
                details: error instanceof Error ? { stack: error.stack } : undefined
            };

            context.errors = context.errors || [];
            context.errors.push(errorContext);

            await this.redis.set(
                `context:${sessionId}`,
                JSON.stringify(context),
                'EX',
                24 * 60 * 60
            );
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'erreur au contexte:', error);
            throw error;
        }
    }
} 