import mongoose from 'mongoose';
import logger from '../services/logger';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';
        
        await mongoose.connect(mongoURI);
        
        logger.info('Connexion à MongoDB établie');
    } catch (error) {
        logger.error('Erreur de connexion à MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB; 