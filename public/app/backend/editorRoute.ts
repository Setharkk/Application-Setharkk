import express, { Request, Response, Router } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { auth } from './authRoutes';
import { successResponse, errorResponse } from './utils/response';

interface ImproveTextRequest {
    text: string;
}

interface SuggestionsRequest {
    text: string;
    context: string;
}

interface OpenAIResponse {
    data: {
        choices: Array<{
            text: string;
        }>;
    };
}

const router: Router = express.Router();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

router.post('/improve-text', auth, async (req: Request<{}, {}, ImproveTextRequest>, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        
        if (!text) {
            errorResponse(res, new Error('Le texte est requis'), 'Le texte est requis', 400);
            return;
        }

        const response: OpenAIResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Améliorer ce texte en termes de grammaire, style et concision : ${text}`,
            max_tokens: 1000
        });

        successResponse(res, { 
            improvedText: response.data.choices[0].text.trim() 
        });
    } catch (error) {
        if (error instanceof Error) {
            errorResponse(res, error);
        } else {
            errorResponse(res, new Error('Une erreur inconnue est survenue'));
        }
    }
});

router.post('/suggestions', auth, async (req: Request<{}, {}, SuggestionsRequest>, res: Response): Promise<void> => {
    try {
        const { text, context } = req.body;

        if (!text || !context) {
            errorResponse(res, new Error('Le texte et le contexte sont requis'), 'Le texte et le contexte sont requis', 400);
            return;
        }

        const response: OpenAIResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Basé sur ce contexte : ${context}\nGénérer des suggestions pour améliorer ce texte : ${text}`,
            max_tokens: 1000
        });

        successResponse(res, {
            suggestions: response.data.choices[0].text.trim().split('\n')
        });
    } catch (error) {
        if (error instanceof Error) {
            errorResponse(res, error);
        } else {
            errorResponse(res, new Error('Une erreur inconnue est survenue'));
        }
    }
});

export default router; 