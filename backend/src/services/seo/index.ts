import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ElasticsearchService } from '../database/ElasticsearchService';

interface SeoAnalysisResult {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  score: number;
}

interface SeoAnalysisDocument extends Record<string, unknown> {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  score: number;
  timestamp: string;
}

interface ElasticsearchResponse {
  hits: {
    total: { value: number };
    hits: Array<{
      _source: SeoAnalysisDocument;
      _id: string;
    }>;
  };
}

export class SEOService extends BaseService {
  private readonly elasticsearch: ElasticsearchService;
  private readonly INDEX_NAME = 'seo_analyses';

  constructor() {
    super(
      {
        id: 'seo',
        name: 'SEO Service',
        type: ServiceType.BUSINESS,
        dependencies: ['database', 'analytics']
      },
      {
        version: '1.0.0',
        description: 'Service d\'analyse et d\'optimisation SEO',
        author: 'Setharkk',
        tags: ['seo', 'analytics', 'optimization']
      }
    );
    this.elasticsearch = new ElasticsearchService({
      node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200'
    });
  }

  protected async doInitialize(): Promise<void> {
    try {
      await this.elasticsearch.createIndex(this.INDEX_NAME, {
        properties: {
          url: { type: 'keyword' },
          title: { type: 'text' },
          description: { type: 'text' },
          keywords: { type: 'keyword' },
          score: { type: 'float' },
          timestamp: { type: 'date' }
        }
      });
    } catch (error) {
      // Ignorer l'erreur si l'index existe déjà
      if (!(error instanceof Error) || !error.message.includes('resource_already_exists')) {
        throw error;
      }
    }
  }

  protected async doShutdown(): Promise<void> {
    // Arrêt du service
  }

  public async analyzeUrl(url: string): Promise<SeoAnalysisResult> {
    try {
      const response = await axios.get(url);
      if (typeof response.data !== 'string') {
        throw new Error('Réponse invalide: le contenu n\'est pas une chaîne de caractères');
      }
      const $ = cheerio.load(response.data);
      
      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content') ?? '';
      const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) ?? [];
      
      const score = this.calculateScore(title, description, keywords);
      const result = { url, title, description, keywords, score };

      // Sauvegarder l'analyse
      const analysisId = `${url}_${Date.now()}`;
      const document: SeoAnalysisDocument = {
        ...result,
        timestamp: new Date().toISOString()
      };
      await this.elasticsearch.index(this.INDEX_NAME, analysisId, document);

      return result;
    } catch (error) {
      throw new Error(`Erreur lors de l'analyse de l'URL: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private calculateScore(title: string, description: string, keywords: string[]): number {
    let score = 0;
    if (title.length > 0) score += 0.4;
    if (description.length > 0) score += 0.3;
    if (keywords.length > 0) score += 0.3;
    return score;
  }

  public async getAnalysisHistory(url: string): Promise<SeoAnalysisResult[]> {
    const searchResponse: any = await this.elasticsearch.search(this.INDEX_NAME, {
      query: {
        term: { url: url }
      },
      sort: [{ timestamp: 'desc' }],
      size: 10
    });
    
    const hits = searchResponse?.body?.hits?.hits ?? [];
    
    return hits.map((hit: any) => ({
      url: hit._source.url,
      title: hit._source.title,
      description: hit._source.description,
      keywords: hit._source.keywords,
      score: hit._source.score
    }));
  }

  public async generateRecommendations(analysisId: string): Promise<string[]> {
    const analysis = await this.elasticsearch.get<SeoAnalysisDocument>(this.INDEX_NAME, analysisId);
    if (!analysis) {
      throw new Error('Analyse non trouvée');
    }

    const recommendations: string[] = [];
    
    if (!analysis.title || analysis.title.length < 30) {
      recommendations.push('Le titre est trop court. Visez 50-60 caractères.');
    }
    
    if (!analysis.description || analysis.description.length < 120) {
      recommendations.push('La meta description est trop courte. Visez 150-160 caractères.');
    }
    
    if (!analysis.keywords || analysis.keywords.length < 3) {
      recommendations.push('Ajoutez plus de mots-clés pertinents.');
    }

    return recommendations;
  }

  public async getKeywordRankings(url: string, keywords: string[]): Promise<Array<{ keyword: string; rank: number }>> {
    const analysis = await this.analyzeUrl(url);
    
    return keywords.map(keyword => ({
      keyword,
      rank: analysis.keywords.includes(keyword) ? 
        Math.floor(Math.random() * 10) + 1 : // Simulation de rang pour les mots-clés présents
        Math.floor(Math.random() * 90) + 11  // Simulation de rang pour les mots-clés absents
    }));
  }
}

export const seoService = new SEOService(); 