import { Router } from 'express';
import { InteractiveChat, MessageType, ChatMessage } from './index';
import { Redis } from 'ioredis';

export function createChatRoutes(chat: InteractiveChat) {
    const router = Router();

    /**
     * @swagger
     * /api/v1/chat/message:
     *   post:
     *     summary: Envoie un message au chat interactif
     *     tags: [Chat]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - content
     *               - type
     *             properties:
     *               content:
     *                 type: string
     *               type:
     *                 type: string
     *                 enum: [COMMAND, QUERY, RESPONSE, NOTIFICATION]
     *               metadata:
     *                 type: object
     */
    router.post('/message', async (req, res) => {
        try {
            const message: ChatMessage = {
                content: req.body.content,
                type: req.body.type as MessageType,
                metadata: req.body.metadata
            };

            const response = await chat.sendMessage(message);
            res.json(response);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    });

    /**
     * @swagger
     * /api/v1/chat/context:
     *   get:
     *     summary: Récupère le contexte actuel du chat
     *     tags: [Chat]
     */
    router.get('/context', async (req, res) => {
        try {
            const context = await chat.getContext();
            res.json(context);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            });
        }
    });

    /**
     * @swagger
     * /api/v1/chat/status:
     *   get:
     *     summary: Récupère le statut du service de chat
     *     tags: [Chat]
     */
    router.get('/status', (req, res) => {
        res.json({
            status: chat.status,
            name: chat.name,
            type: chat.type
        });
    });

    return router;
}

// WebSocket routes
export function setupWebSocketRoutes(wss: any, chat: InteractiveChat) {
    wss.on('connection', (ws: any) => {
        ws.on('message', async (data: string) => {
            try {
                const message = JSON.parse(data) as ChatMessage;
                const response = await chat.sendMessage(message);
                ws.send(JSON.stringify(response));
            } catch (error) {
                ws.send(JSON.stringify({
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                }));
            }
        });
    });
} 