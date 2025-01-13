import { createClient } from 'redis';
import logger from '../services/logger';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err: Error) => logger.error('Erreur Redis:', err));
redisClient.on('connect', () => logger.info('Connexion à Redis établie'));

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Erreur de connexion à Redis:', error);
        process.exit(1);
    }
};

export const getRedisClient = () => redisClient; 