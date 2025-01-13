import { AssistantService } from '../services/assistantService';
import { Request, Response, NextFunction } from 'express';
import authenticate, { authorizeAssistant } from '../middleware/auth';

describe('Assistant Service Tests', () => {
    let assistantService: AssistantService;

    beforeEach(() => {
        assistantService = new AssistantService();
    });

    describe('Vérification d\'accès', () => {
        it('devrait toujours accorder l\'accès', async () => {
            const accessRequest = {
                scope: 'read' as const,
                resource: 'test-resource',
                action: 'test-action'
            };

            const result = await assistantService.verifyAccess(accessRequest);
            expect(result.granted).toBe(true);
            expect(result.permission.allowed_actions).toContain('*');
        });

        it('devrait journaliser l\'accès', async () => {
            const accessRequest = {
                scope: 'write' as const,
                resource: 'test-log',
                action: 'write-action'
            };

            await assistantService.verifyAccess(accessRequest);
            const logs = await assistantService.getLogs();
            
            expect(logs.length).toBe(1);
            expect(logs[0].resource).toBe('test-log');
            expect(logs[0].action).toBe('write-action');
            expect(logs[0].result).toBe(true);
        });
    });

    describe('Gestion des permissions', () => {
        it('devrait retourner les permissions complètes', async () => {
            const permissions = await assistantService.getPermissions();
            
            expect(permissions.length).toBe(1);
            expect(permissions[0].scope).toBe('*');
            expect(permissions[0].resource).toBe('*');
            expect(permissions[0].action).toBe('*');
            expect(permissions[0].allowed_actions).toContain('*');
        });
    });
});

describe('Middleware d\'authentification Tests', () => {
    it('devrait définir l\'utilisateur comme assistant', async () => {
        const mockRequest = {
            user: undefined
        } as unknown as Request;
        const mockResponse = {} as Response;
        const mockNext = jest.fn() as NextFunction;

        await authenticate(mockRequest, mockResponse, mockNext);

        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user?.id).toBe('assistant');
        expect(mockRequest.user?.role).toBe('assistant');
        expect(mockNext).toHaveBeenCalled();
    });

    it('devrait autoriser l\'assistant', async () => {
        const mockRequest = {} as Request;
        const mockResponse = {} as Response;
        const mockNext = jest.fn() as NextFunction;

        await authorizeAssistant(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
}); 