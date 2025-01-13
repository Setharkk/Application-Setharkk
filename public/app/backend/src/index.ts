import express from 'express';
import { config } from './config';
import routes from './routes';
import { databaseService } from './services/databaseService';
import { monitoringService } from './services/monitoringService';
import { eventBus } from './events/eventBus';
import logger from './services/logger';

const app = express();

// Middlewares de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Initialisation des services
async function initializeServices() {
    try {
        // Connexion à la base de données
        await databaseService.connect();

        // Configuration des événements
        eventBus.subscribe('database:connected', () => {
            logger.info('Base de données connectée et prête');
        });

        // Démarrage du monitoring
        if (config.monitoring.enabled) {
            setInterval(() => {
                const stats = monitoringService.getStats();
                logger.debug('Statistiques système:', stats);
            }, config.monitoring.metricsInterval);
        }

        // Démarrage du serveur
        app.listen(config.app.port, () => {
            logger.info(`Serveur démarré sur le port ${config.app.port}`);
            eventBus.emit('server:started', {
                port: config.app.port,
                env: config.app.env
            });
        });
    } catch (error) {
        logger.error('Erreur lors de l\'initialisation des services:', error);
        process.exit(1);
    }
}

// Gestion de l'arrêt gracieux
process.on('SIGTERM', async () => {
    logger.info('Signal SIGTERM reçu. Arrêt gracieux...');
    await databaseService.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('Signal SIGINT reçu. Arrêt gracieux...');
    await databaseService.disconnect();
    process.exit(0);
});

// Démarrage de l'application
initializeServices().catch(error => {
    logger.error('Erreur fatale lors du démarrage:', error);
    process.exit(1);
}); 