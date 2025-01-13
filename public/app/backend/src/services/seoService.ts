import { db } from '../config/database';
import { Logger } from '../utils/logger';
import { AppError } from '../errors/appError';
import axios from 'axios';

interface SeoAnalysis {
    title: string;
    description: string;
    keywords: string[];
    headings: {
        h1: string[];
        h2: string[];
        h3: string[];
    };
    wordCount: number;
    loadTime: number;
    statusCode: number;
}

interface KeywordRanking {
    keyword: string;
    rank: number;
}

interface SeoReport {
    url: string;
    analysis: SeoAnalysis;
    suggestions: string[];
    score: number;
    timestamp: Date;
}

interface AnalysisFilters {
    url?: string;
    dateRange?: [Date, Date];
}

export class SeoService {
    private logger: Logger;

    constructor() {
        this.logger = new Logger('SeoService');
    }

    async analyzeUrl(url: string): Promise<SeoAnalysis> {
        try {
            const response = await axios.get(url);
            const html = response.data;
            
            const analysis: SeoAnalysis = {
                title: this.extractTitle(html),
                description: this.extractMetaDescription(html),
                keywords: this.extractKeywords(html),
                headings: this.extractHeadings(html),
                wordCount: this.countWords(html),
                loadTime: response.duration,
                statusCode: response.status
            };

            await this.saveAnalysis(url, analysis);
            return analysis;
        } catch (error) {
            this.logger.error('Erreur dans analyzeUrl:', error as Error);
            throw new AppError('Échec de l\'analyse de l\'URL', 500);
        }
    }

    async getAnalysisHistory(filters: AnalysisFilters = {}): Promise<any[]> {
        try {
            let query = db('seo_analysis');
            
            if (filters.url) {
                query = query.where('url', 'like', `%${filters.url}%`);
            }
            
            if (filters.dateRange) {
                query = query.whereBetween('created_at', filters.dateRange);
            }
            
            return await query
                .select('*')
                .orderBy('created_at', 'desc');
        } catch (error) {
            this.logger.error('Erreur dans getAnalysisHistory:', error as Error);
            throw new AppError('Échec de la récupération de l\'historique des analyses SEO', 500);
        }
    }

    async getKeywordRankings(keywords: string[]): Promise<KeywordRanking[]> {
        try {
            const rankings = await Promise.all(
                keywords.map(async keyword => {
                    const rank = await this.checkKeywordRank(keyword);
                    return { keyword, rank };
                })
            );
            
            await this.saveKeywordRankings(rankings);
            return rankings;
        } catch (error) {
            this.logger.error('Erreur dans getKeywordRankings:', error as Error);
            throw new AppError('Échec de la récupération des classements des mots-clés', 500);
        }
    }

    async generateSeoReport(url: string): Promise<SeoReport> {
        try {
            const analysis = await this.analyzeUrl(url);
            const suggestions = this.generateSuggestions(analysis);
            
            const report: SeoReport = {
                url,
                analysis,
                suggestions,
                score: this.calculateSeoScore(analysis),
                timestamp: new Date()
            };

            await this.saveReport(report);
            return report;
        } catch (error) {
            this.logger.error('Erreur dans generateSeoReport:', error as Error);
            throw new AppError('Échec de la génération du rapport SEO', 500);
        }
    }

    private extractTitle(html: string): string {
        const match = html.match(/<title>(.*?)<\/title>/i);
        return match ? match[1].trim() : '';
    }

    private extractMetaDescription(html: string): string {
        const match = html.match(/<meta name="description" content="(.*?)"/i);
        return match ? match[1].trim() : '';
    }

    private extractKeywords(html: string): string[] {
        const match = html.match(/<meta name="keywords" content="(.*?)"/i);
        return match ? match[1].split(',').map(k => k.trim()) : [];
    }

    private extractHeadings(html: string): { h1: string[], h2: string[], h3: string[] } {
        const headings = {
            h1: [] as string[],
            h2: [] as string[],
            h3: [] as string[]
        };
        
        for (let i = 1; i <= 3; i++) {
            const regex = new RegExp(`<h${i}>(.*?)<\/h${i}>`, 'gi');
            let match;
            while ((match = regex.exec(html)) !== null) {
                headings[`h${i}`].push(match[1].trim());
            }
        }
        
        return headings;
    }

    private countWords(html: string): number {
        const text = html.replace(/<[^>]*>/g, ' ');
        return text.trim().split(/\s+/).length;
    }

    private async saveAnalysis(url: string, analysis: SeoAnalysis): Promise<void> {
        await db('seo_analysis').insert({
            url,
            analysis: JSON.stringify(analysis),
            created_at: new Date()
        });
    }

    private async checkKeywordRank(keyword: string): Promise<number> {
        // Simulation - À remplacer par une vraie API de vérification de rang
        return Math.floor(Math.random() * 100) + 1;
    }

    private async saveKeywordRankings(rankings: KeywordRanking[]): Promise<void> {
        await db('keyword_rankings').insert(
            rankings.map(r => ({
                keyword: r.keyword,
                rank: r.rank,
                checked_at: new Date()
            }))
        );
    }

    private generateSuggestions(analysis: SeoAnalysis): string[] {
        const suggestions: string[] = [];
        
        if (!analysis.title || analysis.title.length < 30) {
            suggestions.push('Le titre est trop court. Visez 50-60 caractères.');
        }
        
        if (!analysis.description || analysis.description.length < 120) {
            suggestions.push('La meta description est trop courte. Visez 150-160 caractères.');
        }
        
        if (analysis.headings.h1.length === 0) {
            suggestions.push('Aucune balise H1 trouvée. Ajoutez un titre principal.');
        }
        
        return suggestions;
    }

    private calculateSeoScore(analysis: SeoAnalysis): number {
        let score = 100;
        
        if (!analysis.title) score -= 10;
        if (!analysis.description) score -= 10;
        if (analysis.headings.h1.length === 0) score -= 15;
        if (analysis.wordCount < 300) score -= 10;
        
        return Math.max(0, score);
    }

    private async saveReport(report: SeoReport): Promise<void> {
        await db('seo_reports').insert({
            url: report.url,
            report: JSON.stringify(report),
            score: report.score,
            created_at: report.timestamp
        });
    }
}

export const seoService = new SeoService(); 