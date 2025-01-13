import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';

interface TextAnalysisResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    summary: string;
    entities?: string[];
    language?: string;
    topics?: string[];
}

interface DataAnalysisResult {
    patterns: Array<{
        name: string;
        confidence: number;
        description: string;
    }>;
    outliers: Array<{
        value: number;
        score: number;
        reason: string;
    }>;
    trends: Array<{
        direction: 'up' | 'down' | 'stable';
        magnitude: number;
        period: string;
    }>;
}

interface MetricsAnalysisResult {
    summary: {
        min: number;
        max: number;
        mean: number;
        median: number;
        stdDev: number;
    };
    anomalies: Array<{
        timestamp: Date;
        value: number;
        expectedValue: number;
        deviation: number;
    }>;
    predictions: Array<{
        timestamp: Date;
        value: number;
        confidence: number;
    }>;
}

interface CustomAnalysisResult {
    [key: string]: unknown;
}

type AnalysisData = 
    | { type: 'text'; content: string }
    | { type: 'data'; content: unknown[] }
    | { type: 'metrics'; content: Record<string, number> }
    | { type: 'custom'; content: unknown };

type AnalysisResultData = 
    | { type: 'text'; data: TextAnalysisResult }
    | { type: 'data'; data: DataAnalysisResult }
    | { type: 'metrics'; data: MetricsAnalysisResult }
    | { type: 'custom'; data: CustomAnalysisResult };

interface AnalysisMetadata {
    processingTime: number;
    modelVersion?: string;
    parameters?: Record<string, unknown>;
    source?: string;
    quality?: {
        completeness: number;
        accuracy: number;
        reliability: number;
    };
}

interface AnalysisResult {
    id: string;
    type: 'text' | 'data' | 'metrics' | 'custom';
    timestamp: Date;
    data: AnalysisResultData['data'];
    metadata?: AnalysisMetadata;
    score?: number;
    confidence?: number;
    recommendations?: string[];
}

interface AnalysisRequest {
    type: AnalysisResult['type'];
    data: AnalysisData['content'];
    options?: {
        depth?: number;
        timeout?: number;
        filters?: string[];
        customParams?: Record<string, unknown>;
    };
}

interface AnalysisStats {
    totalAnalyses: number;
    averageProcessingTime: number;
    successRate: number;
    byType: Record<string, number>;
}

export class AnalysisService extends BaseService {
    private results: Map<string, AnalysisResult>;
    private readonly maxResults = 1000;

    constructor() {
        super(
            {
                id: 'analysis-service-001',
                name: 'Analysis Service',
                type: ServiceType.BUSINESS,
                dependencies: ['metrics-service', 'ml-service', 'memory-service']
            },
            {
                version: '1.2.0',
                description: 'Advanced analysis service providing text, data, metrics and custom analysis capabilities',
                author: 'DevTeam',
                tags: ['analysis', 'ml', 'metrics', 'processing']
            }
        );
        
        this.results = new Map();
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Service d\'analyse initialisé');
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Service d\'analyse arrêté');
        this.results.clear();
    }

    async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
        try {
            const startTime = Date.now();
            const id = this.generateAnalysisId();

            logger.info(`Démarrage de l'analyse ${id} de type ${request.type}`);

            const result = await this.processAnalysis(request);
            const analysisResult: AnalysisResult = {
                id,
                type: request.type,
                timestamp: new Date(),
                data: result.data,
                metadata: {
                    processingTime: Date.now() - startTime,
                    ...result.metadata
                },
                score: result.score,
                confidence: result.confidence,
                recommendations: result.recommendations
            };

            this.results.set(id, analysisResult);
            this.trimResults();

            logger.info(`Analyse ${id} terminée avec succès`);
            return analysisResult;
        } catch (error) {
            logger.error('Erreur lors de l\'analyse:', error);
            throw error;
        }
    }

    async getResult(id: string): Promise<AnalysisResult | null> {
        return this.results.get(id) || null;
    }

    async listResults(filter?: {
        type?: AnalysisResult['type'];
        startDate?: Date;
        endDate?: Date;
        minScore?: number;
        minConfidence?: number;
    }): Promise<AnalysisResult[]> {
        try {
            let results = Array.from(this.results.values());

            if (filter) {
                results = results.filter(result => {
                    if (filter.type && result.type !== filter.type) return false;
                    if (filter.startDate && result.timestamp < filter.startDate) return false;
                    if (filter.endDate && result.timestamp > filter.endDate) return false;
                    if (filter.minScore && (result.score || 0) < filter.minScore) return false;
                    if (filter.minConfidence && (result.confidence || 0) < filter.minConfidence) return false;
                    return true;
                });
            }

            return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        } catch (error) {
            logger.error('Erreur lors de la récupération des résultats:', error);
            throw error;
        }
    }

    async getStats(timeRange?: { start: Date; end: Date }): Promise<AnalysisStats> {
        try {
            let results = Array.from(this.results.values());
            
            if (timeRange) {
                results = results.filter(r => 
                    r.timestamp >= timeRange.start && 
                    r.timestamp <= timeRange.end
                );
            }

            const typeCount: Record<string, number> = {};
            let totalTime = 0;
            let successCount = 0;

            results.forEach(result => {
                typeCount[result.type] = (typeCount[result.type] || 0) + 1;
                totalTime += result.metadata?.processingTime || 0;
                if (result.score && result.score > 0.5) successCount++;
            });

            return {
                totalAnalyses: results.length,
                averageProcessingTime: results.length > 0 ? totalTime / results.length : 0,
                successRate: results.length > 0 ? (successCount / results.length) * 100 : 0,
                byType: typeCount
            };
        } catch (error) {
            logger.error('Erreur lors du calcul des statistiques:', error);
            throw error;
        }
    }

    private generateAnalysisId(): string {
        return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    private async processAnalysis(request: AnalysisRequest): Promise<{
        data: AnalysisResultData['data'];
        metadata?: AnalysisMetadata;
        score?: number;
        confidence?: number;
        recommendations?: string[];
    }> {
        try {
            switch (request.type) {
                case 'text':
                    return await this.analyzeText(request.data as string, request.options);
                case 'data':
                    return await this.analyzeData(request.data as unknown[], request.options);
                case 'metrics':
                    return await this.analyzeMetrics(request.data as Record<string, number>, request.options);
                case 'custom':
                    return await this.customAnalysis(request.data, request.options);
                default:
                    throw new Error(`Type d'analyse non supporté: ${request.type}`);
            }
        } catch (error) {
            logger.error(`Erreur lors du traitement de l'analyse de type ${request.type}:`, error);
            throw error;
        }
    }

    private async analyzeText(data: string, options?: AnalysisRequest['options']): Promise<{
        data: TextAnalysisResult;
        score: number;
        confidence: number;
    }> {
        // Simulation d'analyse basique du texte
        const minWordLength = options?.customParams?.minWordLength as number || 3;
        const keywords = data.toLowerCase().split(' ').filter(word => word.length > minWordLength);
        const sentiment = data.includes('bon') || data.includes('super') ? 'positive' : 'neutral';
        
        return {
            data: {
                sentiment,
                keywords,
                summary: data.substring(0, options?.customParams?.summaryLength as number || 100) + (data.length > 100 ? '...' : ''),
                entities: [],
                language: 'fr',
                topics: []
            },
            score: 0.8,
            confidence: 0.9
        };
    }

    private async analyzeData(data: unknown[], options?: AnalysisRequest['options']): Promise<{
        data: DataAnalysisResult;
        score: number;
        confidence: number;
    }> {
        const depth = options?.depth || 1;
        const patterns = data.slice(0, depth * 10).map((_, index) => ({
            name: `pattern${index + 1}`,
            confidence: 0.85,
            description: 'Sample pattern'
        }));

        return {
            data: {
                patterns,
                outliers: [{
                    value: 100,
                    score: 0.95,
                    reason: 'Significant deviation'
                }],
                trends: [{
                    direction: 'up',
                    magnitude: 0.75,
                    period: '1d'
                }]
            },
            score: 0.75,
            confidence: 0.85
        };
    }

    private async analyzeMetrics(data: Record<string, number>, options?: AnalysisRequest['options']): Promise<{
        data: MetricsAnalysisResult;
        score: number;
        confidence: number;
    }> {
        const values = Object.values(data);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const threshold = options?.customParams?.anomalyThreshold as number || 2;
        
        return {
            data: {
                summary: {
                    min,
                    max,
                    mean,
                    median: (() => {
                        const sorted = [...values].sort((a, b) => a - b);
                        return sorted[Math.floor(sorted.length / 2)];
                    })(),
                    stdDev: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
                },
                anomalies: values
                    .filter(val => Math.abs(val - mean) > threshold * mean)
                    .map(val => ({
                        timestamp: new Date(),
                        value: val,
                        expectedValue: mean,
                        deviation: (val - mean) / mean
                    })),
                predictions: [{
                    timestamp: new Date(),
                    value: mean,
                    confidence: options?.customParams?.predictionConfidence as number || 0.85
                }]
            },
            score: 0.9,
            confidence: 0.95
        };
    }

    private async customAnalysis(data: unknown, options?: AnalysisRequest['options']): Promise<{
        data: CustomAnalysisResult;
        score: number;
        confidence: number;
    }> {
        const result: CustomAnalysisResult = {
            rawData: data,
            analysisType: typeof data,
            timestamp: new Date().toISOString(),
            hasValue: data !== null && data !== undefined,
            customParams: options?.customParams || {},
            depth: options?.depth || 1,
            filters: options?.filters || []
        };
        
        return {
            data: result,
            score: 0.7,
            confidence: 0.8
        };
    }

    private trimResults(): void {
        if (this.results.size > this.maxResults) {
            const sortedResults = Array.from(this.results.entries())
                .sort(([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime());
            
            this.results = new Map(sortedResults.slice(0, this.maxResults));
        }
    }
}

export const analysisService = new AnalysisService(); 