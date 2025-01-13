const request = require('supertest');
const app = require('../../app/backend/server');
const mongoose = require('mongoose');

describe('API Integration Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Routes de scénarios', () => {
        test('GET /api/scenarios devrait retourner tous les scénarios', async () => {
            const res = await request(app).get('/api/scenarios');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.scenarios)).toBe(true);
        });

        test('POST /api/scenarios devrait créer un nouveau scénario', async () => {
            const scenario = {
                nom: 'Test Scenario',
                description: 'Description test',
                type: 'vente'
            };
            const res = await request(app).post('/api/scenarios').send(scenario);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.scenario.nom).toBe(scenario.nom);
        });
    });

    describe('Routes prédictives', () => {
        test('POST /api/predictions devrait générer des prédictions', async () => {
            const res = await request(app).post('/api/predictions').send({
                historique_actions: []
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.predictions).toBeDefined();
        });
    });

    describe('Routes d\'apprentissage', () => {
        test('POST /api/apprentissage devrait analyser le contenu', async () => {
            const res = await request(app).post('/api/apprentissage').send({
                contenu: 'Test de contenu marketing avec prospection'
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.analyse).toBeDefined();
        });
    });
}); 