import { Orchestrator } from '../../../src/core/orchestrator';
import { contextAnalysisAdapter, enhancedLearningAdapter } from '../services/serviceAdapters';
import { createClient } from 'redis';
import { connect } from 'amqplib';
import logger from '../services/logger';

export async function initializeOrchestrator(): Promise<Orchestrator> {
    try {
        // Connexion à Redis
        const redisClient = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        // Connexion à RabbitMQ
        const amqpConnection = await connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        const channel = await amqpConnection.createChannel();

        // Création de l'orchestrateur
        const orchestrator = new Orchestrator(channel, redisClient);
        await orchestrator.initialize();

        // Enregistrement des services
        await orchestrator.registerService(contextAnalysisAdapter);
        await orchestrator.registerService(enhancedLearningAdapter);

        logger.info('Orchestrateur initialisé avec succès');
        
        return orchestrator;
    } catch (error) {
        logger.error('Erreur lors de l\'initialisation de l\'orchestrateur:', error);
        throw error;
    }
} 