import request from 'supertest';
import { expect } from 'chai';
import app from '../../main';
import { Response } from 'supertest';

interface ChatMessage {
    message: string;
    timestamp: string;
}

interface ChatAction {
    message: string;
    data: unknown;
}

interface ChatHistory {
    history: ChatMessage[];
}

interface ErrorResponse {
    error: string;
}

interface SuccessResponse {
    success: boolean;
}

describe('Tests d\'intégration Chat', () => {
    describe('POST /api/chat/message', () => {
        it('devrait retourner une erreur 400 si le message est manquant', async () => {
            const res: Response = await request(app)
                .post('/api/chat/message')
                .send({});
            
            expect(res.status).to.equal(400);
            expect(res.body as ErrorResponse).to.have.property('error');
        });

        it('devrait traiter un message valide', async () => {
            const res: Response = await request(app)
                .post('/api/chat/message')
                .send({ message: 'Test message' });
            
            const body = res.body as ChatMessage;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('message');
            expect(body).to.have.property('timestamp');
        });
    });

    describe('POST /api/chat/action', () => {
        it('devrait traiter une action SEO', async () => {
            const res: Response = await request(app)
                .post('/api/chat/action')
                .send({ action: 'seo' });
            
            const body = res.body as ChatAction;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('message');
            expect(body).to.have.property('data');
        });

        it('devrait traiter une action editor', async () => {
            const res: Response = await request(app)
                .post('/api/chat/action')
                .send({ action: 'editor' });
            
            const body = res.body as ChatAction;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('message');
            expect(body).to.have.property('data');
        });

        it('devrait retourner une erreur 400 pour une action invalide', async () => {
            const res: Response = await request(app)
                .post('/api/chat/action')
                .send({ action: 'invalid' });
            
            expect(res.status).to.equal(400);
            expect(res.body as ErrorResponse).to.have.property('error');
        });
    });

    describe('GET /api/chat/history', () => {
        it('devrait retourner l\'historique des messages', async () => {
            const res: Response = await request(app)
                .get('/api/chat/history');
            
            const body = res.body as ChatHistory;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('history');
            expect(Array.isArray(body.history)).to.be.true;
        });
    });

    describe('DELETE /api/chat/history', () => {
        it('devrait effacer l\'historique des messages', async () => {
            const res: Response = await request(app)
                .delete('/api/chat/history');
            
            const body = res.body as SuccessResponse;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('success', true);
        });
    });
}); 