import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { createChatRoutes } from './core/interactive-chat/routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité et d'optimisation
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/api/chat', createChatRoutes());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
}); 