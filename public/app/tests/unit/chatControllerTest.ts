import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { ChatController } from '../../backend/controllers/chatController';

interface ChatMessage {
    message: string;
    timestamp: string;
}

interface ChatAction {
    message: string;
    data: unknown;
}

describe('ChatController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonSpy: sinon.SinonSpy;
    let statusStub: sinon.SinonStub;

    beforeEach(() => {
        jsonSpy = sinon.spy();
        statusStub = sinon.stub().returns({ json: jsonSpy });
        
        req = {
            body: {},
            params: {}
        };
        res = {
            json: sinon.spy(),
            status: statusStub
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('handleMessage', () => {
        it('devrait retourner une erreur si le message est manquant', async () => {
            await ChatController.handleMessage(req as Request, res as Response);
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith({
                error: 'Message requis'
            })).to.be.true;
        });

        it('devrait traiter le message avec succès', async () => {
            req.body = { message: 'Test message' };
            await ChatController.handleMessage(req as Request, res as Response);
            
            const jsonSpy = res.json as sinon.SinonSpy;
            expect(jsonSpy.called).to.be.true;
            
            const response = jsonSpy.firstCall.args[0] as ChatMessage;
            expect(response).to.have.property('message');
            expect(response).to.have.property('timestamp');
        });
    });

    describe('handleAction', () => {
        it('devrait retourner une erreur si l\'action est invalide', async () => {
            req.body = { action: 'invalid' };
            await ChatController.handleAction(req as Request, res as Response);
            expect(statusStub.calledWith(400)).to.be.true;
        });

        it('devrait traiter une action SEO', async () => {
            req.body = { action: 'seo' };
            await ChatController.handleAction(req as Request, res as Response);
            
            const jsonSpy = res.json as sinon.SinonSpy;
            expect(jsonSpy.called).to.be.true;
            
            const response = jsonSpy.firstCall.args[0] as ChatAction;
            expect(response).to.have.property('message');
            expect(response).to.have.property('data');
        });

        it('devrait traiter une action editor', async () => {
            req.body = { action: 'editor' };
            await ChatController.handleAction(req as Request, res as Response);
            
            const jsonSpy = res.json as sinon.SinonSpy;
            expect(jsonSpy.called).to.be.true;
            
            const response = jsonSpy.firstCall.args[0] as ChatAction;
            expect(response).to.have.property('message');
            expect(response).to.have.property('data');
        });
    });
}); 