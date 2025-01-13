import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { initializeServices, shutdownServices } from './config/services';
import routes from './routes';
import logger from './services/logger';

// Charger les variables d'environnement
config();

const app = express();
const port = process.env.PORT ?? 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
logger.info('Configuration CORS: ' + JSON.stringify(corsOptions));

// Routes API
app.use('/api', routes);

// Gestion des erreurs globale
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erreur globale:', err);
  res.status(500).json({
    error: 'Une erreur est survenue',
    details: err.message
  });
});

// Initialiser les services avant de démarrer le serveur
const startServer = async () => {
  try {
    await initializeServices();
    
    const server = app.listen(port, () => {
      logger.info(`Serveur démarré sur le port ${port}`);
      logger.info(`URL frontend autorisée: ${corsOptions.origin}`);
    });

    // Gestion de l'arrêt gracieux
    const shutdown = async () => {
      logger.info('Arrêt du serveur...');
      await shutdownServices();
      server.close(() => {
        logger.info('Serveur arrêté');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer(); 