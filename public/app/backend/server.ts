import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import authRoutes from './routes/authRoutes';
import marketingRoutes from './routes/marketingRoutes';
import automationRoutes from './routes/automationRoutes';
import reportRoutes from './routes/reportRoutes';
import chatRoutes from './routes/chatRoutes';
import { errorResponse } from './utils/response';
import logger from './utils/logger';

// Charger les variables d'environnement
dotenv.config();

const app: Express = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Configuration de la base de données
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Test de la connexion à la base de données
pool.connect()
    .then(() => logger.info('Connexion à la base de données établie'))
    .catch((err) => logger.logErreur(err, { context: 'database_connection' }));

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'ok', 
        message: 'Le serveur fonctionne correctement',
        timestamp: new Date().toISOString()
    });
});

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);

// Interface pour les erreurs personnalisées
interface CustomError extends Error {
    status?: number;
    code?: string;
}

// Gestion des erreurs
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    logger.logErreur(err, {
        path: req.path,
        method: req.method,
        status: err.status || 500,
        code: err.code
    });

    errorResponse(res, err, 'Une erreur est survenue sur le serveur', err.status || 500);
});

// Démarrage du serveur
app.listen(port, () => {
    logger.info(`Serveur démarré sur le port ${port}`, {
        port,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Export pour les tests
export { app, pool }; 