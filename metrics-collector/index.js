const express = require('express');
const client = require('prom-client');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const app = express();
const register = new client.Registry();

// Création des métriques
const activeUsers = new client.Gauge({
  name: 'business_active_users',
  help: 'Nombre d\'utilisateurs actifs'
});

const newUsers = new client.Counter({
  name: 'business_new_users',
  help: 'Nombre de nouveaux utilisateurs'
});

const revenue = new client.Counter({
  name: 'business_revenue',
  help: 'Revenu total en euros',
  labelNames: ['type']
});

const conversionRate = new client.Gauge({
  name: 'business_conversion_rate',
  help: 'Taux de conversion en pourcentage'
});

const sessionDuration = new client.Histogram({
  name: 'business_session_duration_seconds',
  help: 'Durée des sessions utilisateurs',
  buckets: [60, 300, 600, 1800, 3600]
});

// Enregistrement des métriques
register.registerMetric(activeUsers);
register.registerMetric(newUsers);
register.registerMetric(revenue);
register.registerMetric(conversionRate);
register.registerMetric(sessionDuration);

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Connexion Redis
const redis = new Redis(process.env.REDIS_URI);

// Mise à jour des métriques
async function updateMetrics() {
  try {
    // Utilisateurs actifs (depuis Redis)
    const activeCount = await redis.scard('active_users');
    activeUsers.set(activeCount);

    // Nouveaux utilisateurs (depuis MongoDB)
    const newUsersCount = await mongoose.model('User').countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
    });
    newUsers.inc(newUsersCount);

    // Revenu (depuis MongoDB)
    const dailyRevenue = await mongoose.model('Transaction').aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) },
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
    
    if (dailyRevenue.length > 0) {
      revenue.inc({ type: 'daily' }, dailyRevenue[0].total);
    }

    // Taux de conversion
    const totalVisits = await redis.get('total_visits') || 1;
    const conversions = await mongoose.model('Transaction').countDocuments({
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
    });
    
    conversionRate.set((conversions / totalVisits) * 100);

  } catch (error) {
    console.error('Erreur lors de la mise à jour des métriques:', error);
  }
}

// Routes
app.get('/metrics', async (req, res) => {
  try {
    await updateMetrics();
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const port = process.env.PORT || 9091;
app.listen(port, () => {
  console.log(`Metrics collector listening on port ${port}`);
}); 