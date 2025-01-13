import logger from '../logger';
import { AppError } from '../../errors/appError';

interface PageData {
    title: string;
    description: string;
    keywords: string[];
    h1: string[];
    h2: string[];
    h3: string[];
    images: Array<{
        src: string;
        alt?: string;
    }>;
    loadTime: number;
    performanceScore: number;
    content?: string;
}

interface MetaTags {
    title: string;
    description: string;
    keywords: string[];
}

interface Headings {
    h1: string[];
    h2: string[];
    h3: string[];
}

interface Performance {
    score: number;
}

interface Suggestion {
    type: 'title' | 'description' | 'images' | 'other';
    priority: 'low' | 'medium' | 'high';
    description: string;
}

interface Keyword {
    word: string;
    density: number;
    relevance: number;
}

interface Change {
    field: string;
    oldValue: string | number | string[] | null;
    newValue: string | number | string[] | null;
}

interface HistoryEntry {
    date: Date;
    changes: Change[];
}

class AnalysisModel {
    url: string;
    metaTags: MetaTags;
    headings: Headings;
    images: Array<{ src: string; alt?: string }>;
    performance: Performance;
    seoScore: number;
    suggestions: Suggestion[];
    keywords: Keyword[];
    history?: HistoryEntry[];
    timestamp: Date;

    constructor(data: Partial<AnalysisModel>) {
        this.url = data.url ?? '';
        this.metaTags = data.metaTags ?? { title: '', description: '', keywords: [] };
        this.headings = data.headings ?? { h1: [], h2: [], h3: [] };
        this.images = data.images ?? [];
        this.performance = data.performance ?? { score: 0 };
        this.seoScore = data.seoScore ?? 0;
        this.suggestions = data.suggestions ?? [];
        this.keywords = data.keywords ?? [];
        this.timestamp = data.timestamp ?? new Date();
    }

    async save(): Promise<this> {
        // Simulation de sauvegarde
        logger.info(`Analyse sauvegardée pour l'URL: ${this.url}`);
        return this;
    }

    static async findOne(query: { url: string }): Promise<AnalysisModel | null> {
        // Simulation de recherche
        logger.info(`Recherche d'analyse pour l'URL: ${query.url}`);
        return null;
    }

    static async find(query: { url: string }): Promise<AnalysisModel[]> {
        // Simulation de recherche multiple
        logger.info(`Recherche des analyses pour l'URL: ${query.url}`);
        return [];
    }

    static async getAnalysisHistory(url: string): Promise<AnalysisModel[]> {
        const analyses = await AnalysisModel.find({ url });
        return analyses.sort((a, b) => (b.timestamp ?? new Date()).getTime() - (a.timestamp ?? new Date()).getTime());
    }
}

export class AnalysisService {
    constructor() {
        logger.info('AnalysisService initialized');
    }

    async analyzeUrl(url: string, pageData: PageData): Promise<AnalysisModel> {
        try {
            const seoScore = this.calculateSeoScore(pageData);
            const suggestions = this.generateSuggestions(pageData);
            const keywords = this.analyzeKeywords(pageData);

            const existingAnalysis = await AnalysisModel.findOne({ url });

            const newAnalysis = new AnalysisModel({
                url,
                metaTags: {
                    title: pageData.title,
                    description: pageData.description,
                    keywords: pageData.keywords
                },
                headings: {
                    h1: pageData.h1,
                    h2: pageData.h2,
                    h3: pageData.h3
                },
                images: pageData.images,
                performance: {
                    score: pageData.performanceScore
                },
                seoScore,
                suggestions,
                keywords
            });

            if (existingAnalysis) {
                const changes = this.detectChanges(existingAnalysis, newAnalysis);
                if (changes.length > 0) {
                    newAnalysis.history = [{
                        date: new Date(),
                        changes
                    }];
                    if (existingAnalysis.history) {
                        newAnalysis.history = newAnalysis.history.concat(existingAnalysis.history);
                    }
                }
            }

            return newAnalysis;
        } catch (error) {
            logger.error('Erreur lors de l\'analyse:', error as Error);
            throw error instanceof AppError ? error : new AppError('Erreur lors de l\'analyse', 500);
        }
    }

    private calculateSeoScore(pageData: PageData): number {
        let score = 100;

        if (!pageData.title) score -= 10;
        else if (pageData.title.length < 30 || pageData.title.length > 60) score -= 5;

        if (!pageData.description) score -= 10;
        else if (pageData.description.length < 120 || pageData.description.length > 160) score -= 5;

        if (!pageData.h1 || pageData.h1.length === 0) score -= 10;
        if (pageData.h1 && pageData.h1.length > 1) score -= 5;

        const imagesWithoutAlt = pageData.images.filter(img => !img.alt).length;
        if (imagesWithoutAlt > 0) score -= (imagesWithoutAlt * 2);

        return Math.max(0, score);
    }

    private generateSuggestions(pageData: PageData): Suggestion[] {
        const suggestions: Suggestion[] = [];

        if (!pageData.title) {
            suggestions.push({
                type: 'title',
                priority: 'high',
                description: 'Ajouter un titre à la page'
            });
        } else if (pageData.title.length < 30) {
            suggestions.push({
                type: 'title',
                priority: 'medium',
                description: 'Le titre est trop court, il devrait faire au moins 30 caractères'
            });
        }

        if (!pageData.description) {
            suggestions.push({
                type: 'description',
                priority: 'high',
                description: 'Ajouter une meta description'
            });
        }

        const imagesWithoutAlt = pageData.images.filter(img => !img.alt);
        if (imagesWithoutAlt.length > 0) {
            suggestions.push({
                type: 'images',
                priority: 'medium',
                description: `${imagesWithoutAlt.length} image(s) sans attribut alt`
            });
        }

        return suggestions;
    }

    private analyzeKeywords(pageData: PageData): Keyword[] {
        const keywords: Keyword[] = [];
        const text = this.extractText(pageData);
        const words = text.toLowerCase().split(/\W+/);
        const wordCount = words.length;

        const wordFrequency: Record<string, number> = {};
        words.forEach(word => {
            if (word.length > 3) {
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
        });

        Object.entries(wordFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .forEach(([word, count]) => {
                keywords.push({
                    word,
                    density: (count / wordCount) * 100,
                    relevance: this.calculateRelevance(word, pageData)
                });
            });

        return keywords;
    }

    private extractText(pageData: PageData): string {
        const parts = [
            pageData.title,
            pageData.description,
            ...pageData.h1,
            ...pageData.h2,
            ...pageData.h3,
            pageData.content
        ].filter(Boolean);

        return parts.join(' ');
    }

    private calculateRelevance(word: string, pageData: PageData): number {
        let relevance = 0;

        if (pageData.title?.toLowerCase().includes(word)) relevance += 3;
        if (pageData.description?.toLowerCase().includes(word)) relevance += 2;
        if (pageData.h1?.some(h => h.toLowerCase().includes(word))) relevance += 2;
        if (pageData.h2?.some(h => h.toLowerCase().includes(word))) relevance += 1;

        return relevance;
    }

    private detectChanges(oldAnalysis: AnalysisModel, newAnalysis: AnalysisModel): Change[] {
        const changes: Change[] = [];

        if (oldAnalysis.metaTags.title !== newAnalysis.metaTags.title) {
            changes.push({
                field: 'title',
                oldValue: oldAnalysis.metaTags.title,
                newValue: newAnalysis.metaTags.title
            });
        }

        if (oldAnalysis.metaTags.description !== newAnalysis.metaTags.description) {
            changes.push({
                field: 'description',
                oldValue: oldAnalysis.metaTags.description,
                newValue: newAnalysis.metaTags.description
            });
        }

        if (oldAnalysis.seoScore !== newAnalysis.seoScore) {
            changes.push({
                field: 'seoScore',
                oldValue: oldAnalysis.seoScore,
                newValue: newAnalysis.seoScore
            });
        }

        return changes;
    }

    async getAnalysisHistory(url: string): Promise<AnalysisModel[]> {
        const analyses = await AnalysisModel.find({ url });
        return analyses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    async getTopKeywords(url: string): Promise<Keyword[]> {
        const analyses = await this.getAnalysisHistory(url);
        if (analyses.length === 0) return [];

        return analyses[0].keywords.sort((a, b) => b.relevance - a.relevance);
    }

    async generateReport(url: string): Promise<{
        url: string;
        currentScore: number;
        scoreImprovement: number;
        totalChanges: number;
        topKeywords: Keyword[];
        currentSuggestions: Suggestion[];
        analysisCount: number;
        firstAnalysisDate: Date;
        lastAnalysisDate: Date;
    } | null> {
        const analyses = await this.getAnalysisHistory(url);
        if (analyses.length === 0) return null;

        const latestAnalysis = analyses[0];
        const firstAnalysis = analyses[analyses.length - 1];

        return {
            url,
            currentScore: latestAnalysis.seoScore,
            scoreImprovement: latestAnalysis.seoScore - firstAnalysis.seoScore,
            totalChanges: analyses.reduce((sum, analysis) => 
                sum + (analysis.history?.length ?? 0), 0),
            topKeywords: latestAnalysis.keywords.slice(0, 5),
            currentSuggestions: latestAnalysis.suggestions,
            analysisCount: analyses.length,
            firstAnalysisDate: firstAnalysis.timestamp,
            lastAnalysisDate: latestAnalysis.timestamp
        };
    }
}

export const analysisService = new AnalysisService(); 