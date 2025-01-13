import axios, { AxiosResponse } from 'axios';

interface EditorResponse {
    success: boolean;
    data: any;
}

interface ReadabilityLevel {
    min: number;
    text: string;
    class: string;
}

interface ReadabilityAnalysis {
    score: number;
    level?: ReadabilityLevel;
    suggestions: string[];
}

interface SeoAnalysis {
    score: number;
    suggestions: string[];
}

interface GrammarAnalysis {
    errors: Array<{
        message: string;
        offset: number;
        length: number;
    }>;
    suggestions: string[];
}

interface ContentAnalysis {
    readability: ReadabilityAnalysis;
    seo: SeoAnalysis;
    grammar: GrammarAnalysis;
}

const API_URL: string = process.env.VUE_APP_API_URL || '';
const DEBOUNCE_DELAY: number = 500;

export const useEditorController = () => {
    const initializeEditor = async (): Promise<EditorResponse> => {
        try {
            const response: AxiosResponse<EditorResponse> = await axios.post(`${API_URL}/api/editor/initialize`);
            if (!response.data) {
                throw new Error('Réponse invalide du serveur');
            }
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'éditeur:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur lors de l\'initialisation de l\'éditeur'
                    : 'Erreur lors de l\'initialisation de l\'éditeur'
            );
        }
    };

    const updateContent = async (content: string): Promise<EditorResponse> => {
        try {
            if (!content) {
                return { success: true, data: { content: '' } };
            }

            const response: AxiosResponse<EditorResponse> = await axios.post(`${API_URL}/api/editor/update`, { content });
            if (!response.data) {
                throw new Error('Réponse invalide du serveur');
            }
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contenu:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur lors de la mise à jour du contenu'
                    : 'Erreur lors de la mise à jour du contenu'
            );
        }
    };

    const analyzeContent = async (content: string | undefined): Promise<EditorResponse> => {
        try {
            if (!content?.trim()) {
                return {
                    success: true,
                    data: {
                        readability: { score: 0, suggestions: ['Ajoutez du contenu pour l\'analyse'] },
                        seo: { score: 0, suggestions: ['Ajoutez du contenu pour l\'analyse SEO'] },
                        grammar: { errors: [], suggestions: [] }
                    }
                };
            }

            const response: AxiosResponse<EditorResponse> = await axios.post(`${API_URL}/api/editor/analyze`, { content });
            if (!response.data) {
                throw new Error('Réponse invalide du serveur');
            }
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'analyse du contenu:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur lors de l\'analyse du contenu'
                    : 'Erreur lors de l\'analyse du contenu'
            );
        }
    };

    const formatAnalysis = (data: any): ContentAnalysis => {
        if (!data) {
            return {
                readability: { score: 0, level: getReadabilityLevel(0), suggestions: [] },
                seo: { score: 0, suggestions: [] },
                grammar: { errors: [], suggestions: [] }
            };
        }

        return {
            readability: {
                score: data.readability?.score || 0,
                level: getReadabilityLevel(data.readability?.score || 0),
                suggestions: data.readability?.suggestions || []
            },
            seo: {
                score: data.seo?.score || 0,
                suggestions: data.seo?.suggestions || []
            },
            grammar: {
                errors: data.grammar?.errors || [],
                suggestions: data.grammar?.suggestions || []
            }
        };
    };

    const getReadabilityLevel = (score: number): ReadabilityLevel => {
        const levels: ReadabilityLevel[] = [
            { min: 90, text: 'Très facile à lire', class: 'text-green-500' },
            { min: 80, text: 'Facile à lire', class: 'text-green-400' },
            { min: 70, text: 'Assez facile à lire', class: 'text-green-300' },
            { min: 60, text: 'Standard', class: 'text-yellow-500' },
            { min: 50, text: 'Assez difficile à lire', class: 'text-yellow-600' },
            { min: 30, text: 'Difficile à lire', class: 'text-red-400' },
            { min: 0, text: 'Très difficile à lire', class: 'text-red-500' }
        ];

        return levels.find(level => score >= level.min) || levels[levels.length - 1];
    };

    return {
        initializeEditor,
        updateContent,
        analyzeContent,
        formatAnalysis,
        DEBOUNCE_DELAY
    };
}; 