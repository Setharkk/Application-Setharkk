import request from 'supertest';
import express from 'express';
import { createChatRoutes } from '../routes';
import { InteractiveChat, MessageType, ResponseStatus } from '../index';
import { Redis } from 'ioredis';
import WebSocket from 'ws';

jest.mock('ioredis');
jest.mock('../index');

describe('Chat Routes', () => {
    let app: express.Application;
    let mockChat: jest.Mocked<InteractiveChat>;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock du chat
        mockChat = {
            sendMessage: jest.fn(),
            getContext: jest.fn(),
            status: 'RUNNING',
            name: 'Test Chat',
            type: 'CHAT'
        } as any;

        // Ajout des routes
        app.use('/api/v1/chat', createChatRoutes(mockChat));
    });

    describe('POST /api/v1/chat/message', () => {
        it('should handle valid message', async () => {
            const mockResponse = {
                content: 'Response content',
                status: ResponseStatus.SUCCESS,
                context: {
                    sessionId: 'test',
                    userId: 'test',
                    timestamp: new Date(),
                    history: [],
                    state: {}
                }
            };

            mockChat.sendMessage.mockResolvedValue(mockResponse);

            const response = await request(app)
                .post('/api/v1/chat/message')
                .send({
                    content: 'Test message',
                    type: MessageType.COMMAND
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(mockChat.sendMessage).toHaveBeenCalled();
        });

        it('should handle invalid message', async () => {
            const response = await request(app)
                .post('/api/v1/chat/message')
                .send({
                    type: MessageType.COMMAND
                    // content manquant
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/v1/chat/context', () => {
        it('should return current context', async () => {
            const mockContext = {
                sessionId: 'test',
                userId: 'test',
                timestamp: new Date(),
                history: [],
                state: {}
            };

            mockChat.getContext.mockResolvedValue(mockContext);

            const response = await request(app)
                .get('/api/v1/chat/context');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockContext);
        });

        it('should handle errors', async () => {
            mockChat.getContext.mockRejectedValue(new Error('Test error'));

            const response = await request(app)
                .get('/api/v1/chat/context');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Test error');
        });
    });

    describe('GET /api/v1/chat/status', () => {
        it('should return chat status', async () => {
            const response = await request(app)
                .get('/api/v1/chat/status');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'RUNNING',
                name: 'Test Chat',
                type: 'CHAT'
            });
        });
    });
});

describe('WebSocket Routes', () => {
    let wss: WebSocket.Server;
    let mockChat: jest.Mocked<InteractiveChat>;

    beforeEach((done) => {
        wss = new WebSocket.Server({ port: 0 }, done);
        mockChat = {
            sendMessage: jest.fn()
        } as any;
    });

    afterEach((done) => {
        wss.close(done);
    });

    it('should handle WebSocket messages', (done) => {
        const mockResponse = {
            content: 'Response content',
            status: ResponseStatus.SUCCESS,
            context: {
                sessionId: 'test',
                userId: 'test',
                timestamp: new Date(),
                history: [],
                state: {}
            }
        };

        mockChat.sendMessage.mockResolvedValue(mockResponse);

        const ws = new WebSocket(`ws://localhost:${(wss.address() as any).port}`);

        ws.on('open', () => {
            ws.send(JSON.stringify({
                content: 'Test message',
                type: MessageType.COMMAND
            }));
        });

        ws.on('message', (data) => {
            const response = JSON.parse(data.toString());
            expect(response).toEqual(mockResponse);
            ws.close();
            done();
        });
    });
}); 