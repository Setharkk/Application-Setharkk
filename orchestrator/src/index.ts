import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import amqp from 'amqplib';
import { createClient } from 'redis';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import winston from 'winston';
import axios from 'axios';
import { ChatMessage, ServiceHealth, AppSocket } from './types';

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 3050;

// Configuration des services
const services = {
  backend: process.env.BACKEND_URL || 'http://backend:3000',
  seo: process.env.SEO_SERVICE_URL || 'http://seo-service:3000',
  memory: process.env.MEMORY_SERVICE_URL || 'http://memory-service:3000',
  chat: process.env.CHAT_SERVICE_URL || 'http://chat-service:3000',
  marketing: process.env.MARKETING_SERVICE_URL || 'http://marketing-service:3040'
};

// Connexions aux services
let redisClient: ReturnType<typeof createClient>;
let elasticClient: ElasticClient;
let rabbitmqChannel: amqp.Channel;
let openai: OpenAI;

async function initializeServices() {
  try {
    // Redis
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
    await redisClient.connect();
    logger.info('Redis connecté');

    // Elasticsearch
    elasticClient = new ElasticClient({
      node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
    });
    await elasticClient.ping();
    logger.info('Elasticsearch connecté');

    // MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://mongodb:27017/app');
    logger.info('MongoDB connecté');

    // RabbitMQ
    const rabbitmqConn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
    rabbitmqChannel = await rabbitmqConn.createChannel();
    logger.info('RabbitMQ connecté');

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      logger.info('OpenAI configuré');
    }
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation des services:', error);
    throw error;
  }
}

// Middleware
app.use(express.json());

// Routes pour chaque service
app.use('/api/seo', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.seo}${req.path}`,
      data: req.body,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error('Erreur SEO:', error);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Service error' });
  }
});

app.use('/api/memory', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.memory}${req.path}`,
      data: req.body,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error('Erreur Memory:', error);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Service error' });
  }
});

app.use('/api/chat', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.chat}${req.path}`,
      data: req.body,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error('Erreur Chat:', error);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Service error' });
  }
});

app.use('/api/marketing', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${services.marketing}${req.path}`,
      data: req.body,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    logger.error('Erreur Marketing:', error);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Service error' });
  }
});

// WebSocket pour les communications en temps réel
io.on('connection', (socket: AppSocket) => {
  logger.info('Nouveau client WebSocket connecté');

  socket.on('join-room', (room: string) => {
    socket.join(room);
    logger.info(`Client rejoint la room: ${room}`);
  });

  socket.on('leave-room', (room: string) => {
    socket.leave(room);
    logger.info(`Client quitte la room: ${room}`);
  });

  socket.on('message', async (data: ChatMessage) => {
    try {
      const { room, message, userId } = data;
      
      // Enregistrement dans Redis pour l'historique récent
      await redisClient.lPush(`chat:${room}`, JSON.stringify({
        userId,
        message,
        timestamp: Date.now()
      }));

      // Diffusion aux autres clients dans la room
      socket.to(room).emit('message', {
        userId,
        message,
        timestamp: Date.now()
      });

      // Indexation dans Elasticsearch
      await elasticClient.index({
        index: 'chat-messages',
        body: {
          room,
          userId,
          message,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Erreur WebSocket:', error);
    }
  });
});

// Endpoint de santé
app.get('/health', async (req, res) => {
  try {
    const health: ServiceHealth = {
      status: 'ok',
      timestamp: new Date(),
      services: {
        redis: redisClient?.isOpen ? 'connected' as const : 'disconnected' as const,
        elasticsearch: await elasticClient?.ping().then(() => 'connected' as const).catch(() => 'disconnected' as const),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' as const : 'disconnected' as const,
        rabbitmq: rabbitmqChannel ? 'connected' as const : 'disconnected' as const,
        openai: openai ? 'configured' as const : 'not configured' as const
      }
    };
    res.json(health);
  } catch (error) {
    logger.error('Erreur health check:', error);
    res.status(500).json({ status: 'error', error: String(error) });
  }
});

// Démarrage du serveur
async function startServer() {
  try {
    await initializeServices();
    httpServer.listen(port, () => {
      logger.info(`Orchestrateur démarré sur http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Erreur au démarrage:', error);
    process.exit(1);
  }
}

startServer(); 