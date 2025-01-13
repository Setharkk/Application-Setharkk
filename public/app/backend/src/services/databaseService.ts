import mongoose from 'mongoose';
import { eventBus } from '../events/eventBus';
import logger from './logger';

class DatabaseService {
    private static instance: DatabaseService;
    private isConnected = false;

    private constructor() {}

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            return;
        }

        try {
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assistant';
            
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000
            });

            this.isConnected = true;
            logger.info('Connecté à MongoDB');
            
            this.setupEventListeners();
            eventBus.emit('database:connected', { timestamp: new Date() });
        } catch (error) {
            logger.error('Erreur de connexion à MongoDB:', error);
            eventBus.emit('database:error', { error });
            throw error;
        }
    }

    private setupEventListeners(): void {
        mongoose.connection.on('error', (error) => {
            this.isConnected = false;
            logger.error('Erreur MongoDB:', error);
            eventBus.emit('database:error', { error });
        });

        mongoose.connection.on('disconnected', () => {
            this.isConnected = false;
            logger.warn('Déconnecté de MongoDB');
            eventBus.emit('database:disconnected', { timestamp: new Date() });
        });
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('Déconnecté de MongoDB');
            eventBus.emit('database:disconnected', { timestamp: new Date() });
        } catch (error) {
            logger.error('Erreur lors de la déconnexion de MongoDB:', error);
            throw error;
        }
    }

    getStatus(): Record<string, any> {
        return {
            isConnected: this.isConnected,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            models: Object.keys(mongoose.models),
            collections: mongoose.connection.collections
        };
    }
}

export const databaseService = DatabaseService.getInstance(); 