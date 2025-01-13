import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import logger from '../services/logger';

export const setupWebSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Client connecté: ${socket.id}`);

        socket.on('message', (data) => {
            logger.info(`Message reçu de ${socket.id}:`, data);
            io.emit('message', data);
        });

        socket.on('disconnect', () => {
            logger.info(`Client déconnecté: ${socket.id}`);
        });
    });

    return io;
}; 