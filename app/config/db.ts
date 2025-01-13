import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import logger from '../backend/utils/logger';

// Charger les variables d'environnement
dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const config: ConnectOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/setharkk_db', config);
        
        logger.info('Connexion à MongoDB établie avec succès !', {
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.logErreur(error, { context: 'database_connection' });
        } else {
            logger.logErreur(new Error('Erreur inconnue de connexion à MongoDB'));
        }
        process.exit(1);
    }
};

// Écouteurs d'événements de la connexion
mongoose.connection.on('disconnected', () => {
    logger.info('Déconnexion de MongoDB');
});

mongoose.connection.on('error', (error) => {
    logger.logErreur(error instanceof Error ? error : new Error('Erreur de connexion MongoDB'), {
        context: 'database_connection_error'
    });
});

export {
    connectDB,
    mongoose as default
}; 