import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { SeoController } from '../../backend/controllers/seoController';

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

describe('SeoController', () => {
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

    describe('analyzePage', () => {
        it('devrait retourner une erreur si l\'URL est manquante', async () => {
            await SeoController.analyzePage(req as Request, res as Response);
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith({
                error: 'URL requise pour l\'analyse'
            })).to.be.true;
        });

        it('devrait analyser une URL valide', async () => {
            req.body = { url: 'https://example.com' };
            await SeoController.analyzePage(req as Request, res as Response);
            
            const jsonSpy = res.json as sinon.SinonSpy;
            expect(jsonSpy.called).to.be.true;
            
            const response = jsonSpy.firstCall.args[0] as SeoAnalysisResponse;
            expect(response).to.have.property('title');
            expect(response).to.have.property('metaTags');
            expect(response).to.have.property('headings');
            expect(response).to.have.property('images');
            expect(response).to.have.property('recommendations');
        });
    });

    describe('optimizePage', () => {
        it('devrait retourner une erreur si l\'URL est manquante', async () => {
            await SeoController.optimizePage(req as Request, res as Response);
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonSpy.calledWith({
                error: 'URL requise pour l\'optimisation'
            })).to.be.true;
        });

        it('devrait optimiser une URL valide', async () => {
            req.body = { url: 'https://example.com' };
            await SeoController.optimizePage(req as Request, res as Response);
            
            const jsonSpy = res.json as sinon.SinonSpy;
            expect(jsonSpy.called).to.be.true;
            
            const response = jsonSpy.firstCall.args[0] as SeoAnalysisResponse;
            expect(response).to.have.property('title');
            expect(response).to.have.property('metaTags');
            expect(response).to.have.property('headings');
            expect(response).to.have.property('images');
            expect(response).to.have.property('recommendations');
        });
    });
}); 