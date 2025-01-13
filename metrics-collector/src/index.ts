import 'dotenv/config';
import express, { Request, Response } from 'express';
import * as client from 'prom-client';
import mongoose from 'mongoose';
import Redis from 'ioredis';

// Interfaces
interface Transaction {
  amount: number;
  status: string;
  createdAt: Date;
}

interface User {
  createdAt: Date;
}

interface MetricUpdate {
  activeUsers: number;
  newUsers: number;
  revenue: number;
  conversionRate: number;
}

// Configuration de l'application
const app = express();
const register = new client.Registry();

// Création des métriques avec types
const activeUsers = new client.Gauge({
  name: 'business_active_users',
  help: 'Nombre d\'utilisateurs actifs',
  registers: [register]
});

const newUsers = new client.Counter({
  name: 'business_new_users',
  help: 'Nombre de nouveaux utilisateurs',
  registers: [register]
});

const revenue = new client.Counter({
  name: 'business_revenue',
  help: 'Revenu total en euros',
  labelNames: ['type'] as const,
  registers: [register]
});

const conversionRate = new client.Gauge({
  name: 'business_conversion_rate',
  help: 'Taux de conversion en pourcentage',
  registers: [register]
});

const sessionDuration = new client.Histogram({
  name: 'business_session_duration_seconds',
  help: 'Durée des sessions utilisateurs',
  buckets: [60, 300, 600, 1800, 3600],
  registers: [register]
});

// Modèles Mongoose
const TransactionModel = mongoose.model<Transaction>('Transaction', new mongoose.Schema({
  amount: Number,
  status: String,
  createdAt: Date
}));

const UserModel = mongoose.model<User>('User', new mongoose.Schema({
  createdAt: Date
}));

// Connexions aux bases de données
async function initializeDatabases(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
}

const redis = new Redis(process.env.REDIS_URI || '');
redis.on('error', (error: Error) => {
  console.error('Erreur Redis:', error);
  process.exit(1);
});

// Mise à jour des métriques
async function updateMetrics(): Promise<MetricUpdate> {
  try {
    // Utilisateurs actifs (depuis Redis)
    const activeCount = await redis.scard('active_users');
    activeUsers.set(activeCount);

    // Nouveaux utilisateurs (depuis MongoDB)
    const oneDayAgo = new Date(Date.now() - 24*60*60*1000);
    const newUsersCount = await UserModel.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });
    newUsers.inc(newUsersCount);

    // Revenu (depuis MongoDB)
    const dailyRevenue = await TransactionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const revenueAmount = dailyRevenue[0]?.total || 0;
    revenue.inc({ type: 'daily' }, revenueAmount);

    // Taux de conversion
    const totalVisits = Number(await redis.get('total_visits')) || 1;
    const conversions = await TransactionModel.countDocuments({
      status: 'completed',
      createdAt: { $gte: oneDayAgo }
    });
    
    const conversionRateValue = (conversions / totalVisits) * 100;
    conversionRate.set(conversionRateValue);

    return {
      activeUsers: activeCount,
      newUsers: newUsersCount,
      revenue: revenueAmount,
      conversionRate: conversionRateValue
    };

  } catch (error) {
    console.error('Erreur lors de la mise à jour des métriques:', error);
    throw error;
  }
}

// Routes avec types
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    await updateMetrics();
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end((error as Error).message);
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Démarrage du serveur
const port = process.env.PORT || 9091;
app.listen(port, async () => {
  await initializeDatabases();
  console.log(`Metrics collector listening on port ${port}`);
}); 