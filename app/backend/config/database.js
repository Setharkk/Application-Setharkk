const mongoose = require('mongoose');
const logger = require('../utils/logger');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    logger.info('Connecté à MongoDB avec succès');

    mongoose.connection.on('error', (err) => {
      logger.error('Erreur MongoDB:', err);
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB déconnecté, tentative de reconnexion...');
      setTimeout(connectDB, 5000);
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
        process.exit(0);
      } catch (err) {
        logger.error('Erreur lors de la fermeture de la connexion MongoDB:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Erreur de connexion MongoDB:', error);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB; 