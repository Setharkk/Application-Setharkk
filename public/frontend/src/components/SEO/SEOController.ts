import axios, { AxiosResponse } from 'axios';

interface MetaTags {
    description?: string;
    keywords?: string[];
}

interface Headings {
    h1Count: number;
    h2Count: number;
}

interface Images {
    total: number;
    withAlt: number;
    withoutAlt: number;
}

interface PageData {
    title?: string;
    metaTags?: MetaTags;
    headings?: Headings;
    images?: Images;
    content?: string;
}

interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
}

interface MetaDetail {
    value: string | string[];
    status: 'success' | 'error';
}

interface StructureDetail {
    value: number;
    status: 'success' | 'error';
}

interface ImageDetails {
    total: number;
    withAlt: number;
    withoutAlt: number;
    status: 'success' | 'error';
}

interface FormattedDetails {
    meta: {
        title: MetaDetail;
        description: MetaDetail;
        keywords: MetaDetail;
    };
    structure: {
        h1Count: StructureDetail;
        h2Count: StructureDetail;
    };
    images: ImageDetails;
}

interface AnalysisResults {
    score: number;
    recommendations: string[];
    details: FormattedDetails;
}

export const useSEOController = () => {
    const analyzePage = async (url: string): Promise<ApiResponse> => {
        try {
            const response: AxiosResponse<ApiResponse> = await axios.post('/api/seo/analyze', { url });
            if (response.data.success) {
                return response.data;
            }
            throw new Error(response.data.message ?? 'Erreur lors de l\'analyse');
        } catch (error) {
            console.error('Erreur lors de l\'analyse SEO:', error);
            throw error;
        }
    };

    const optimizePage = async (pageData: PageData): Promise<ApiResponse> => {
        try {
            const response: AxiosResponse<ApiResponse> = await axios.post('/api/seo/optimize', pageData);
            if (response.data.success) {
                return response.data;
            }
            throw new Error(response.data.message ?? 'Erreur lors de l\'optimisation');
        } catch (error) {
            console.error('Erreur lors de l\'optimisation SEO:', error);
            throw error;
        }
    };

    const formatAnalysisResults = (data: PageData): AnalysisResults => {
        return {
            score: calculateScore(data),
            recommendations: generateRecommendations(data),
            details: formatDetails(data)
        };
    };

    const calculateScore = (data: PageData): number => {
        let score = 100;
        
        // Vérification du titre
        if (!data.title) score -= 20;
        else if (data.title.length < 30 || data.title.length > 60) score -= 10;
        
        // Vérification de la meta description
        if (!data.metaTags?.description) score -= 15;
        else if (data.metaTags.description.length < 120 || data.metaTags.description.length > 160) score -= 7;
        
        // Vérification des mots-clés
        if (!data.metaTags?.keywords || data.metaTags.keywords.length === 0) score -= 10;
        
        // Vérification de la structure des titres
        if (data.headings?.h1Count !== 1) score -= 15;
        if (data.headings?.h2Count === 0) score -= 5;
        
        // Vérification des images
        if (data.images && data.images.withoutAlt > 0) {
            const penaltyPerImage = 5;
            score -= Math.min(20, data.images.withoutAlt * penaltyPerImage);
        }
        
        return Math.max(0, score);
    };

    const generateRecommendations = (data: PageData): string[] => {
        const recommendations: string[] = [];
        
        if (!data.title) {
            recommendations.push("Ajoutez un titre à votre page");
        } else if (data.title.length < 30 || data.title.length > 60) {
            recommendations.push("Optimisez la longueur du titre (30-60 caractères)");
        }
        
        if (!data.metaTags?.description) {
            recommendations.push("Ajoutez une meta description");
        } else if (data.metaTags.description.length < 120 || data.metaTags.description.length > 160) {
            recommendations.push("Optimisez la longueur de la meta description (120-160 caractères)");
        }
        
        if (!data.metaTags?.keywords || data.metaTags.keywords.length === 0) {
            recommendations.push("Ajoutez des mots-clés pertinents");
        }
        
        if (data.headings?.h1Count !== 1) {
            recommendations.push("Assurez-vous d'avoir exactement un titre H1");
        }
        
        if (data.headings?.h2Count === 0) {
            recommendations.push("Ajoutez des sous-titres H2 pour structurer votre contenu");
        }
        
        if (data.images && data.images.withoutAlt > 0) {
            recommendations.push(`Ajoutez des attributs alt aux ${data.images.withoutAlt} images qui n'en ont pas`);
        }
        
        return recommendations;
    };

    const formatDetails = (data: PageData): FormattedDetails => {
        return {
            meta: {
                title: {
                    value: data.title ?? 'Non défini',
                    status: data.title && data.title.length >= 30 && data.title.length <= 60 ? 'success' : 'error'
                },
                description: {
                    value: data.metaTags?.description ?? 'Non définie',
                    status: data.metaTags?.description && data.metaTags.description.length >= 120 && data.metaTags.description.length <= 160 ? 'success' : 'error'
                },
                keywords: {
                    value: data.metaTags?.keywords ?? [],
                    status: data.metaTags?.keywords && data.metaTags.keywords.length > 0 ? 'success' : 'error'
                }
            },
            structure: {
                h1Count: {
                    value: data.headings?.h1Count ?? 0,
                    status: data.headings?.h1Count === 1 ? 'success' : 'error'
                },
                h2Count: {
                    value: data.headings?.h2Count ?? 0,
                    status: data.headings && data.headings.h2Count > 0 ? 'success' : 'error'
                }
            },
            images: {
                total: data.images?.total ?? 0,
                withAlt: data.images?.withAlt ?? 0,
                withoutAlt: data.images?.withoutAlt ?? 0,
                status: data.images?.withoutAlt === 0 ? 'success' : 'error'
            }
        };
    };

    return {
        analyzePage,
        optimizePage,
        formatAnalysisResults
    };
}; 