import express from 'express';
import amqp from 'amqplib';
import { createClient } from 'redis';
import nodemailer from 'nodemailer';
import Mailchimp from 'mailchimp-api-v3';
import Analytics from 'analytics-node';

const app = express();
const port = process.env.PORT || 3040;

// Configuration Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

// Connexion Redis
redisClient.connect().catch(console.error);

// Configuration des services externes
let mailchimp: Mailchimp | null = null;
let analytics: Analytics | null = null;

try {
  if (process.env.MAILCHIMP_API_KEY) {
    mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);
  }
} catch (error) {
  console.warn('Mailchimp non configuré:', error);
}

try {
  if (process.env.SEGMENT_WRITE_KEY) {
    analytics = new Analytics(process.env.SEGMENT_WRITE_KEY);
  }
} catch (error) {
  console.warn('Segment non configuré:', error);
}

app.use(express.json());

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    services: {
      redis: redisClient.isOpen ? 'connected' : 'disconnected',
      mailchimp: mailchimp ? 'configured' : 'not configured',
      analytics: analytics ? 'configured' : 'not configured'
    }
  });
});

// Gestion des newsletters
app.post('/newsletter/subscribe', async (req, res) => {
  try {
    if (!mailchimp) {
      throw new Error('Service Mailchimp non configuré');
    }
    const { email, firstName, lastName } = req.body;
    await mailchimp.post('/lists/{list_id}/members', {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription à la newsletter' });
  }
});

// Suivi des événements marketing
app.post('/track', async (req, res) => {
  try {
    if (!analytics) {
      throw new Error('Service Analytics non configuré');
    }
    const { userId, event, properties } = req.body;
    analytics.track({
      userId,
      event,
      properties
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur tracking:', error);
    res.status(500).json({ error: 'Erreur lors du suivi de l\'événement' });
  }
});

// Gestion des campagnes email
app.post('/campaign/email', async (req, res) => {
  try {
    const { subject, content, recipients } = req.body;
    // TODO: Implémenter la logique d'envoi d'emails
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur campagne:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la campagne email' });
  }
});

app.listen(port, () => {
  console.log(`Service marketing démarré sur http://localhost:${port}`);
}); 