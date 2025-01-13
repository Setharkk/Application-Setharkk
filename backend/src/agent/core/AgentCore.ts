import { Config } from '../../config/config';
import { ContextManager } from './ContextManager';
import { MemoryManager } from './MemoryManager';
import { ServiceOrchestrator } from '../integration/ServiceOrchestrator';
import { ContextEntry } from './types';

export class AgentCore {
    private readonly contextManager: ContextManager;
    private readonly memoryManager: MemoryManager;
    private readonly serviceOrchestrator: ServiceOrchestrator;

    constructor(config: Config) {
        this.contextManager = new ContextManager(config);
        this.memoryManager = new MemoryManager(config);
        this.serviceOrchestrator = new ServiceOrchestrator(config);
    }

    async processMessage(sessionId: string, message: string, userId?: string): Promise<void> {
        try {
            const entry: ContextEntry = {
                role: 'user',
                content: message,
                timestamp: new Date()
            };

            await this.contextManager.updateContext(sessionId, entry, userId);

            // Traitement du message et génération de la réponse
            const response = await this.generateResponse(message, sessionId);

            const responseEntry: ContextEntry = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            await this.contextManager.updateContext(sessionId, responseEntry, userId);

        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            if (error instanceof Error) {
                await this.handleError(sessionId, error);
            } else {
                await this.handleError(sessionId, new Error('Une erreur inconnue est survenue'));
            }
            throw error;
        }
    }

    private async generateResponse(message: string, sessionId: string): Promise<string> {
        try {
            // Logique de génération de réponse à implémenter
            return "Réponse générée";
        } catch (error) {
            console.error('Erreur lors de la génération de la réponse:', error);
            throw error;
        }
    }

    private async handleError(sessionId: string, error: Error): Promise<void> {
        try {
            await this.contextManager.addError(sessionId, error);
        } catch (secondaryError) {
            console.error('Erreur lors de la gestion de l\'erreur:', secondaryError);
        }
    }

    async cleanup(): Promise<void> {
        try {
            await this.memoryManager.cleanup();
            await this.serviceOrchestrator.cleanup();
        } catch (error) {
            console.error('Erreur lors du nettoyage de l\'agent:', error);
            throw error;
        }
    }
} 