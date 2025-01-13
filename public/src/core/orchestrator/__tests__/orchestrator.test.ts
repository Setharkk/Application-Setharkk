import { Orchestrator, IService, ServiceType, ServiceStatus } from '../index';
import { Channel } from 'amqplib';
import { Redis } from 'ioredis';

// Mocks
jest.mock('amqplib');
jest.mock('ioredis');

describe('Orchestrator', () => {
    let orchestrator: Orchestrator;
    let mockMessageQueue: jest.Mocked<Channel>;
    let mockCache: jest.Mocked<Redis>;

    beforeEach(() => {
        // Setup mocks
        mockMessageQueue = {
            assertExchange: jest.fn().mockResolvedValue(undefined),
            assertQueue: jest.fn().mockResolvedValue(undefined),
        } as any;

        mockCache = {
            config: jest.fn().mockResolvedValue('OK'),
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue('OK'),
        } as any;

        orchestrator = new Orchestrator(mockMessageQueue, mockCache);
    });

    describe('initialize', () => {
        it('should setup message queue and cache', async () => {
            await orchestrator.initialize();

            expect(mockMessageQueue.assertExchange).toHaveBeenCalledWith(
                'orchestrator',
                'topic',
                { durable: true }
            );
            expect(mockMessageQueue.assertQueue).toHaveBeenCalledWith(
                'service_events',
                { durable: true }
            );
            expect(mockCache.config).toHaveBeenCalledWith(
                'SET',
                'notify-keyspace-events',
                'Ex'
            );
        });
    });

    describe('registerService', () => {
        it('should register a new service', async () => {
            const mockService: IService = {
                id: 'test-service',
                name: 'Test Service',
                type: ServiceType.MODULE,
                status: ServiceStatus.STOPPED,
                dependencies: [],
                initialize: jest.fn().mockResolvedValue(undefined),
                terminate: jest.fn().mockResolvedValue(undefined),
            };

            await orchestrator.registerService(mockService);
            expect(await orchestrator.getServiceStatus('test-service')).toBe(ServiceStatus.STOPPED);
        });

        it('should fail if dependencies are not met', async () => {
            const mockService: IService = {
                id: 'test-service',
                name: 'Test Service',
                type: ServiceType.MODULE,
                status: ServiceStatus.STOPPED,
                dependencies: ['non-existent-service'],
                initialize: jest.fn().mockResolvedValue(undefined),
                terminate: jest.fn().mockResolvedValue(undefined),
            };

            await expect(orchestrator.registerService(mockService)).rejects.toThrow(
                'Dépendance non satisfaite: non-existent-service'
            );
        });
    });

    describe('removeService', () => {
        it('should remove an existing service', async () => {
            const mockService: IService = {
                id: 'test-service',
                name: 'Test Service',
                type: ServiceType.MODULE,
                status: ServiceStatus.RUNNING,
                dependencies: [],
                initialize: jest.fn().mockResolvedValue(undefined),
                terminate: jest.fn().mockResolvedValue(undefined),
            };

            await orchestrator.registerService(mockService);
            await orchestrator.removeService('test-service');
            expect(await orchestrator.getServiceStatus('test-service')).toBe(ServiceStatus.ERROR);
        });
    });
}); 