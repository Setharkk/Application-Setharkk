import { db } from '../config/database';
import { Logger } from '../utils/logger';
import { AppError } from '../errors/appError';

interface MarketingMetric {
    id: string;
    visitors: number;
    conversions: number;
    revenue: number;
    created_at: Date;
}

interface ProcessedMetrics {
    visitors: number;
    conversions: number;
    revenue: number;
}

type TimeFrame = '7d' | '30d' | '90d' | '365d';

interface Campaign {
    id: string;
    name: string;
    type: 'email' | 'social' | 'ads';
    status: 'draft' | 'active' | 'paused' | 'completed';
    target: Record<string, any>;
    content: string;
    metrics?: MarketingMetric;
    created_at: Date;
    updated_at: Date;
}

interface CampaignFilters {
    status?: Campaign['status'];
    type?: Campaign['type'];
}

interface AutomationWorkflow {
    id: string;
    name: string;
    triggers: string[];
    actions: string[];
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
}

export class MarketingService {
    private logger: Logger;

    constructor() {
        this.logger = new Logger('MarketingService');
    }

    async getAnalytics(timeframe: TimeFrame): Promise<ProcessedMetrics> {
        try {
            const metrics = await db<MarketingMetric>('marketing_metrics')
                .where('created_at', '>=', this.getTimeframeDate(timeframe))
                .select('*');
            
            return this.processMetrics(metrics);
        } catch (error) {
            this.logger.error('Erreur lors de la récupération des analyses:', error as Error);
            throw new AppError('Échec de la récupération des analyses marketing', 500);
        }
    }

    async getCampaigns(filters: CampaignFilters = {}): Promise<Campaign[]> {
        try {
            let query = db<Campaign>('marketing_campaigns');
            
            if (filters.status) {
                query = query.where('status', filters.status);
            }
            
            if (filters.type) {
                query = query.where('type', filters.type);
            }
            
            return await query.select('*');
        } catch (error) {
            this.logger.error('Erreur lors de la récupération des campagnes:', error as Error);
            throw new AppError('Échec de la récupération des campagnes marketing', 500);
        }
    }

    async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
        try {
            const [id] = await db<Campaign>('marketing_campaigns')
                .insert({
                    ...campaignData,
                    created_at: new Date(),
                    updated_at: new Date()
                });
            
            const campaign = await this.getCampaignById(id);
            if (!campaign) {
                throw new AppError('Erreur lors de la création de la campagne', 500);
            }
            
            return campaign;
        } catch (error) {
            this.logger.error('Erreur lors de la création de la campagne:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec de la création de la campagne marketing', 500);
        }
    }

    async updateCampaign(id: string, updates: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>): Promise<Campaign> {
        try {
            await db<Campaign>('marketing_campaigns')
                .where({ id })
                .update({
                    ...updates,
                    updated_at: new Date()
                });
            
            const campaign = await this.getCampaignById(id);
            if (!campaign) {
                throw new AppError('Campagne non trouvée', 404);
            }
            
            return campaign;
        } catch (error) {
            this.logger.error('Erreur lors de la mise à jour de la campagne:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec de la mise à jour de la campagne marketing', 500);
        }
    }

    async deleteCampaign(id: string): Promise<boolean> {
        try {
            const deleted = await db<Campaign>('marketing_campaigns')
                .where({ id })
                .delete();
            
            if (!deleted) {
                throw new AppError('Campagne non trouvée', 404);
            }
            
            return true;
        } catch (error) {
            this.logger.error('Erreur lors de la suppression de la campagne:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec de la suppression de la campagne marketing', 500);
        }
    }

    async getAutomationWorkflows(): Promise<AutomationWorkflow[]> {
        try {
            return await db<AutomationWorkflow>('marketing_automation')
                .select('*')
                .orderBy('created_at', 'desc');
        } catch (error) {
            this.logger.error('Erreur lors de la récupération des workflows:', error as Error);
            throw new AppError('Échec de la récupération des workflows d\'automatisation', 500);
        }
    }

    private getTimeframeDate(timeframe: TimeFrame): Date {
        const now = new Date();
        switch (timeframe) {
            case '7d':
                return new Date(now.setDate(now.getDate() - 7));
            case '30d':
                return new Date(now.setDate(now.getDate() - 30));
            case '90d':
                return new Date(now.setDate(now.getDate() - 90));
            case '365d':
                return new Date(now.setDate(now.getDate() - 365));
            default:
                return new Date(now.setDate(now.getDate() - 30));
        }
    }

    private processMetrics(metrics: MarketingMetric[]): ProcessedMetrics {
        return metrics.reduce((acc, metric) => ({
            visitors: (acc.visitors || 0) + metric.visitors,
            conversions: (acc.conversions || 0) + metric.conversions,
            revenue: (acc.revenue || 0) + metric.revenue
        }), { visitors: 0, conversions: 0, revenue: 0 });
    }

    private async getCampaignById(id: string): Promise<Campaign | undefined> {
        return await db<Campaign>('marketing_campaigns')
            .where({ id })
            .first();
    }
}

export const marketingService = new MarketingService(); 