import { IService, ServiceType, ServiceStatus } from '../../../src/core/orchestrator';
import { contextAnalysisService } from './contextAnalysisService';
import { enhancedLearningService } from './enhancedLearningService';
import logger from './logger';

export class ContextAnalysisAdapter implements IService {
    id = 'context-analysis-service';
    name = 'Service d\'Analyse Contextuelle';
    type = ServiceType.MODULE;
    status = ServiceStatus.INITIALIZING;
    dependencies = ['memory-service', 'ml-service'];

    async initialize(): Promise<void> {
        try {
            // Initialisation du service
            this.status = ServiceStatus.RUNNING;
            logger.info('Service d\'analyse contextuelle initialisé');
        } catch (error) {
            this.status = ServiceStatus.ERROR;
            logger.error('Erreur lors de l\'initialisation du service d\'analyse contextuelle:', error);
            throw error;
        }
    }

    async terminate(): Promise<void> {
        try {
            this.status = ServiceStatus.STOPPED;
            logger.info('Service d\'analyse contextuelle arrêté');
        } catch (error) {
            logger.error('Erreur lors de l\'arrêt du service d\'analyse contextuelle:', error);
            throw error;
        }
    }
}

export class EnhancedLearningAdapter implements IService {
    id = 'enhanced-learning-service';
    name = 'Service d\'Apprentissage Amélioré';
    type = ServiceType.MODULE;
    status = ServiceStatus.INITIALIZING;
    dependencies = ['context-analysis-service', 'ml-service'];

    async initialize(): Promise<void> {
        try {
            // Initialisation du service
            this.status = ServiceStatus.RUNNING;
            logger.info('Service d\'apprentissage amélioré initialisé');
        } catch (error) {
            this.status = ServiceStatus.ERROR;
            logger.error('Erreur lors de l\'initialisation du service d\'apprentissage:', error);
            throw error;
        }
    }

    async terminate(): Promise<void> {
        try {
            this.status = ServiceStatus.STOPPED;
            logger.info('Service d\'apprentissage amélioré arrêté');
        } catch (error) {
            logger.error('Erreur lors de l\'arrêt du service d\'apprentissage:', error);
            throw error;
        }
    }
}

// Export des instances
export const contextAnalysisAdapter = new ContextAnalysisAdapter();
export const enhancedLearningAdapter = new EnhancedLearningAdapter(); 