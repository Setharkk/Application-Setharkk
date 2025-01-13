import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';

interface SentimentAnalysis {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
}

interface TextAnalysis {
    sentiment: SentimentAnalysis;
    entities: string[];
    keywords: string[];
    summary: string;
}

export class MLService extends BaseService {
  constructor() {
    super(
      {
        id: 'ml',
        name: 'Machine Learning Service',
        type: ServiceType.CORE,
        dependencies: []
      },
      {
        version: '1.0.0',
        description: 'Service de machine learning',
        author: 'Setharkk',
        tags: ['ml', 'ai', 'nlp']
      }
    );
  }

  protected async doInitialize(): Promise<void> {
    logger.info('Initializing ML service');
    // Initialization logic here
  }

  protected async doShutdown(): Promise<void> {
    logger.info('Shutting down ML service');
    // Cleanup logic here
  }

  public async analyzeText(text: string): Promise<TextAnalysis> {
    const sentiment = await this.analyzeSentiment(text);
    const entities = await this.extractEntities(text);
    const keywords = await this.extractKeywords(text);
    const summary = await this.generateSummary(text);

    return {
      sentiment,
      entities,
      keywords,
      summary
    };
  }

  private async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    // Basic sentiment analysis based on positive/negative word count
    const positiveWords = text.match(/good|great|excellent|happy|nice/gi)?.length ?? 0;
    const negativeWords = text.match(/bad|poor|terrible|sad|awful/gi)?.length ?? 0;
    const score = (positiveWords - negativeWords) / (text.split(' ').length ?? 1);
    return { 
      score: Math.max(-1, Math.min(1, score)),
      label: this.getSentimentLabel(score)
    };
  }

  private getSentimentLabel(score: number): SentimentAnalysis['label'] {
    if (score > 0.2) return 'positive';
    if (score < -0.2) return 'negative';
    return 'neutral';
  }

  public async extractEntities(text: string): Promise<string[]> {
    // Basic entity extraction (capitalized words)
    return text.match(/[A-Z][a-z]+/g) ?? [];
  }

  private async extractKeywords(text: string): Promise<string[]> {
    // Basic keyword extraction (words longer than 5 chars)
    return [...new Set(text.split(/\W+/).filter(word => word.length > 5))];
  }

  public async generateSummary(text: string, maxLength?: number): Promise<string> {
    // Implement text summarization
    const length = maxLength ?? 100;
    return text.substring(0, length) + '...';
  }

  public async classifyContent(text: string, categories: string[]): Promise<string> {
    // Basic classification - returns the first matching category based on keyword presence
    const lowercaseText = text.toLowerCase();
    return categories.find(category => lowercaseText.includes(category.toLowerCase())) ?? categories[0];
  }

  public async moderateContent(text: string): Promise<boolean> {
    // Basic content moderation - check for inappropriate words
    const inappropriateWords = ['hate', 'violence', 'abuse', 'explicit'];
    const lowercaseText = text.toLowerCase();
    return !inappropriateWords.some(word => lowercaseText.includes(word));
  }

  public async generateResponse(prompt: string, context?: Record<string, unknown>, options?: Record<string, unknown>): Promise<string> {
    // Basic response generation - concatenates prompt with context
    const contextStr = context ? Object.entries(context).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
    return `Réponse générée pour: ${prompt}\nContexte: ${contextStr}`;
  }
}

export const mlService = new MLService(); 