import { Logger } from '../utils/logger';
import { MLService } from './mlService';
import { AppError } from '../errors/appError';

interface ErrorContext {
    stack?: string;
    metadata?: Record<string, any>;
}

interface ErrorAnalysis {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestions: string[];
    relatedPatterns?: string[];
}

interface ErrorSuggestion {
    action: string;
    description: string;
    confidence: number;
}

export class ErrorCorrectionService {
    private logger: Logger;
    private mlService: MLService;
    private errorHistory: Array<{
        error: Error;
        context: ErrorContext;
        analysis?: ErrorAnalysis;
        timestamp: Date;
    }>;

    constructor() {
        this.logger = new Logger('ErrorCorrectionService');
        this.mlService = new MLService();
        this.errorHistory = [];
    }

    async handleError(error: Error, context: ErrorContext) {
        try {
            // Analyser l'erreur
            const analysis = await this.analyzeAndSuggest(error, context);

            // Enregistrer dans l'historique
            this.errorHistory.push({
                error,
                context,
                analysis,
                timestamp: new Date()
            });

            // Générer des suggestions
            const suggestions = await this.generateSuggestions(error, context);

            return {
                success: true,
                analysis,
                suggestions
            };
        } catch (error) {
            this.logger.error('Erreur lors du traitement de l\'erreur:', error);
            throw error instanceof AppError ? error : new AppError('Erreur lors du traitement de l\'erreur', 500);
        }
    }

    async analyzeAndSuggest(error: Error, context: ErrorContext): Promise<ErrorAnalysis> {
        try {
            // Analyser le message d'erreur
            const analysis = await this.mlService.analyzeMessage(error.message);

            // Déterminer la sévérité
            const severity = this.determineSeverity(error, context);

            // Identifier les patterns similaires
            const relatedPatterns = await this.findRelatedPatterns(error.message);

            return {
                type: analysis.intent,
                severity,
                suggestions: [],
                relatedPatterns
            };
        } catch (error) {
            this.logger.error('Erreur lors de l\'analyse:', error);
            throw error instanceof AppError ? error : new AppError('Erreur lors de l\'analyse', 500);
        }
    }

    async generateSuggestions(error: Error, context: ErrorContext): Promise<ErrorSuggestion[]> {
        try {
            const suggestions = await this.mlService.generateSuggestions(error.message);
            
            return suggestions.map(suggestion => ({
                action: suggestion,
                description: suggestion,
                confidence: 0.8
            }));
        } catch (error) {
            this.logger.error('Erreur lors de la génération des suggestions:', error);
            throw error instanceof AppError ? error : new AppError('Erreur lors de la génération des suggestions', 500);
        }
    }

    getErrorHistory(limit: number = 10) {
        return this.errorHistory
            .slice(-limit)
            .map(({ error, context, analysis, timestamp }) => ({
                message: error.message,
                stack: context.stack,
                metadata: context.metadata,
                analysis,
                timestamp
            }));
    }

    private determineSeverity(error: Error, context: ErrorContext): ErrorAnalysis['severity'] {
        if (error instanceof TypeError || error instanceof ReferenceError) {
            return 'high';
        }
        if (context.stack?.includes('node_modules')) {
            return 'medium';
        }
        return 'low';
    }

    private async findRelatedPatterns(errorMessage: string): Promise<string[]> {
        try {
            const analysis = await this.mlService.analyzeMessage(errorMessage);
            return Object.keys(analysis.entities);
        } catch (error) {
            this.logger.error('Erreur lors de la recherche des patterns:', error);
            return [];
        }
    }
}

export const errorCorrectionService = new ErrorCorrectionService(); 