import { InteractiveChat, MessageType, ResponseStatus, ChatCommandHandler } from '../index';
import { Redis } from 'ioredis';
import { ServiceStatus } from '../../orchestrator';

// Mocks
jest.mock('ioredis');

describe('InteractiveChat', () => {
    let chat: InteractiveChat;
    let mockCache: jest.Mocked<Redis>;

    beforeEach(() => {
        // Setup mocks
        mockCache = {
            config: jest.fn().mockResolvedValue('OK'),
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue('OK'),
        } as any;

        chat = new InteractiveChat(mockCache);
    });

    describe('initialization', () => {
        it('should initialize correctly', async () => {
            await chat.initialize();
            expect(chat.status).toBe(ServiceStatus.RUNNING);
            expect(mockCache.config).toHaveBeenCalled();
        });
    });

    describe('message handling', () => {
        it('should handle empty message content', async () => {
            const message = {
                content: '',
                type: MessageType.COMMAND
            };

            const response = await chat.sendMessage(message);
            expect(response.status).toBe(ResponseStatus.ERROR);
            expect(response.content).toBe('Le contenu du message est requis');
        });

        it('should create new context if none exists', async () => {
            const message = {
                content: 'test',
                type: MessageType.COMMAND
            };

            const response = await chat.sendMessage(message);
            expect(response.status).toBe(ResponseStatus.ERROR); // Car pas de handler
            expect(response.context).toBeDefined();
            expect(response.context.history).toEqual([]);
        });

        it('should use existing context if provided', async () => {
            const existingContext = {
                sessionId: 'test-session',
                userId: 'test-user',
                timestamp: new Date(),
                history: [],
                state: {}
            };

            const message = {
                content: 'test',
                type: MessageType.COMMAND,
                context: existingContext
            };

            const response = await chat.sendMessage(message);
            expect(response.context.sessionId).toBe('test-session');
        });
    });

    describe('command handlers', () => {
        it('should register and use command handlers', async () => {
            const mockHandler: ChatCommandHandler = {
                canHandle: jest.fn().mockReturnValue(true),
                handle: jest.fn().mockResolvedValue({
                    content: 'success',
                    status: ResponseStatus.SUCCESS,
                    context: {
                        sessionId: 'test',
                        userId: 'test',
                        timestamp: new Date(),
                        history: [],
                        state: {}
                    }
                })
            };

            chat.registerHandler(mockHandler);

            const message = {
                content: 'test command',
                type: MessageType.COMMAND
            };

            const response = await chat.sendMessage(message);
            expect(response.status).toBe(ResponseStatus.SUCCESS);
            expect(mockHandler.canHandle).toHaveBeenCalled();
            expect(mockHandler.handle).toHaveBeenCalled();
        });

        it('should return error if no handler found', async () => {
            const message = {
                content: 'test command',
                type: MessageType.COMMAND
            };

            const response = await chat.sendMessage(message);
            expect(response.status).toBe(ResponseStatus.ERROR);
            expect(response.content).toContain('Aucun handler trouvé');
        });
    });

    describe('context management', () => {
        it('should save context after message processing', async () => {
            const mockHandler: ChatCommandHandler = {
                canHandle: jest.fn().mockReturnValue(true),
                handle: jest.fn().mockResolvedValue({
                    content: 'success',
                    status: ResponseStatus.SUCCESS,
                    context: {
                        sessionId: 'test',
                        userId: 'test',
                        timestamp: new Date(),
                        history: [],
                        state: {}
                    }
                })
            };

            chat.registerHandler(mockHandler);

            const message = {
                content: 'test command',
                type: MessageType.COMMAND
            };

            await chat.sendMessage(message);
            expect(mockCache.set).toHaveBeenCalled();
        });
    });
}); 