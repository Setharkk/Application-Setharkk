import request from 'supertest';
import { expect } from 'chai';
import app from '../../main';
import { Response } from 'supertest';

interface SeoAnalysisResponse {
    title: string;
    metaTags: {
        description?: string;
        keywords?: string;
        [key: string]: string | undefined;
    };
    headings: {
        h1: string[];
        h2: string[];
        h3: string[];
    };
    images: Array<{
        src: string;
        alt: string;
    }>;
    recommendations: string[];
}

interface ErrorResponse {
    error: string;
}

describe('Tests d\'intégration SEO', () => {
    describe('POST /api/seo/analyze', () => {
        it('devrait retourner une erreur 400 si l\'URL est manquante', async () => {
            const res: Response = await request(app)
                .post('/api/seo/analyze')
                .send({});
            
            expect(res.status).to.equal(400);
            expect(res.body as ErrorResponse).to.have.property('error');
        });

        it('devrait analyser une URL valide', async () => {
            const res: Response = await request(app)
                .post('/api/seo/analyze')
                .send({ url: 'https://example.com' });
            
            const body = res.body as SeoAnalysisResponse;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('title');
            expect(body).to.have.property('metaTags');
            expect(body).to.have.property('headings');
            expect(body).to.have.property('images');
            expect(body).to.have.property('recommendations');
        });
    });

    describe('POST /api/seo/optimize', () => {
        it('devrait retourner une erreur 400 si l\'URL est manquante', async () => {
            const res: Response = await request(app)
                .post('/api/seo/optimize')
                .send({});
            
            expect(res.status).to.equal(400);
            expect(res.body as ErrorResponse).to.have.property('error');
        });

        it('devrait optimiser une URL valide', async () => {
            const res: Response = await request(app)
                .post('/api/seo/optimize')
                .send({ url: 'https://example.com' });
            
            const body = res.body as SeoAnalysisResponse;
            expect(res.status).to.equal(200);
            expect(body).to.have.property('title');
            expect(body).to.have.property('metaTags');
            expect(body).to.have.property('headings');
            expect(body).to.have.property('images');
            expect(body).to.have.property('recommendations');
        });
    });
}); 