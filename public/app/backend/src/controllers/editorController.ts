import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response';

interface EditorConfig {
    mode: 'wysiwyg';
    language: string;
    plugins: string[];
}

export const initializeEditor = async (req: Request, res: Response): Promise<void> => {
    try {
        const config: EditorConfig = {
            mode: 'wysiwyg',
            language: 'fr',
            plugins: ['seo', 'grammar', 'readability']
        };

        logger.info('Éditeur initialisé avec succès');
        successResponse(res, { content: '', config });
    } catch (error) {
        logger.error('Erreur lors de l\'initialisation de l\'éditeur:', error);
        errorResponse(res, error instanceof Error ? error : new Error('Erreur inconnue'), 'Erreur lors de l\'initialisation de l\'éditeur');
    }
}; 