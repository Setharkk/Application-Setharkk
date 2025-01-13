import axios, { AxiosResponse } from 'axios';

interface ChatResponse {
    message: string;
    success: boolean;
    data?: any;
}

interface MetaTags {
    description?: string;
    keywords?: string[];
}

interface Headings {
    h1Count: number;
    h2Count: number;
    structure: string;
}

interface Images {
    total: number;
    withAlt: number;
    withoutAlt: number;
}

interface SeoData {
    title?: string;
    metaTags?: MetaTags;
    headings?: Headings;
    images?: Images;
    recommendations?: string[];
}

interface EditorData {
    status?: string;
    mode?: string;
    message?: string;
}

type ActionType = 'seo' | 'editor';

const API_URL: string = process.env.VUE_APP_API_URL || '';

export const useChatController = () => {
    const sendMessage = async (message: string): Promise<ChatResponse> => {
        try {
            const response: AxiosResponse<ChatResponse> = await axios.post(`${API_URL}/api/chat/message`, { message });
            if (!response.data) {
                throw new Error('Réponse invalide du serveur');
            }
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur de communication avec le serveur'
                    : 'Erreur de communication avec le serveur'
            );
        }
    };

    const sendAction = async (action: ActionType): Promise<ChatResponse> => {
        try {
            const response: AxiosResponse<ChatResponse> = await axios.post(`${API_URL}/api/chat/action`, { action });
            if (!response.data) {
                throw new Error('Réponse invalide du serveur');
            }
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de l'action ${action}:`, error);
            throw new Error(
                error instanceof Error && 'response' in error
                    ? (error.response as any)?.data?.message || 'Erreur de communication avec le serveur'
                    : 'Erreur de communication avec le serveur'
            );
        }
    };

    const formatActionData = (action: ActionType, data: any): string => {
        if (!data) return 'Aucune donnée disponible';
        
        switch (action) {
            case 'seo':
                return formatSEOData(data as SeoData);
            case 'editor':
                return formatEditorData(data as EditorData);
            default:
                return JSON.stringify(data, null, 2);
        }
    };

    const formatSEOData = (data: SeoData): string => {
        if (!data) return 'Aucune donnée SEO disponible';

        return `
### Résultats de l'analyse SEO

#### Méta-données
- Titre: ${data.title || 'Non défini'}
- Description: ${data.metaTags?.description || 'Non définie'}
- Mots-clés: ${data.metaTags?.keywords?.join(', ') || 'Non définis'}

#### Structure
- Titres H1: ${data.headings?.h1Count || 0}
- Titres H2: ${data.headings?.h2Count || 0}
- Structure: ${data.headings?.structure || 'À améliorer'}

#### Images
- Total: ${data.images?.total || 0}
- Avec alt: ${data.images?.withAlt || 0}
- Sans alt: ${data.images?.withoutAlt || 0}

${data.recommendations ? `#### Recommandations\n${data.recommendations.join('\n')}` : ''}
        `.trim();
    };

    const formatEditorData = (data: EditorData): string => {
        if (!data) return 'Aucune donnée éditeur disponible';

        return `
### État de l'éditeur
- Status: ${data.status || 'Prêt'}
- Mode: ${data.mode || 'Normal'}
${data.message ? `\n${data.message}` : ''}
        `.trim();
    };

    return {
        sendMessage,
        sendAction,
        formatActionData
    };
}; 