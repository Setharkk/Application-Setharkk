import { MLService } from '../../services/mlService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ML Service Tests', () => {
    let mlService: MLService;

    beforeEach(() => {
        mlService = new MLService();
        jest.clearAllMocks();
    });

    describe('Analyse de sentiment', () => {
        it('devrait analyser le sentiment d\'un message', async () => {
            const mockResponse = {
                data: {
                    sentiment: 'positif',
                    score: 0.8
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
            
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const result = await mlService.analyzeSentiment('Super message !');
            
            expect(result).toEqual(mockResponse.data);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                { text: 'Super message !' }
            );
        });
    });

    describe('Génération de résumé', () => {
        it('devrait générer un résumé du texte', async () => {
            const mockResponse = {
                data: {
                    summary: 'Résumé du texte'
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
            
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const result = await mlService.generateSummary('Un long texte à résumer...');
            
            expect(result).toEqual(mockResponse.data);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                { text: 'Un long texte à résumer...' }
            );
        });
    });

    describe('Modération de contenu', () => {
        it('devrait modérer le contenu', async () => {
            const mockResponse = {
                data: {
                    isAppropriate: true,
                    confidence: 0.9
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            };
            
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const result = await mlService.moderateContent('Contenu à modérer');
            
            expect(result).toEqual(mockResponse.data);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                { text: 'Contenu à modérer' }
            );
        });

        it('devrait gérer les erreurs de modération', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Erreur API'));

            await expect(mlService.moderateContent('Contenu problématique'))
                .rejects
                .toThrow('Erreur API');
        });
    });
}); 