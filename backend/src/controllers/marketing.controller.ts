import { Request, Response } from 'express';
import { marketingService } from '../services';
import logger from '../services/logger';

export class MarketingController {
    async createCampaign(req: Request, res: Response) {
        try {
            const campaignData = req.body;
            const campaign = await marketingService.createCampaign(campaignData);
            res.json(campaign);
        } catch (error) {
            logger.error('Erreur lors de la création de la campagne:', error);
            res.status(500).json({ error: 'Erreur lors de la création de la campagne' });
        }
    }

    async getCampaigns(req: Request, res: Response) {
        try {
            const { status, type } = req.query;
            const campaigns = await marketingService.getCampaigns({
                status: status as string,
                type: type as string
            });
            res.json(campaigns);
        } catch (error) {
            logger.error('Erreur lors de la récupération des campagnes:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des campagnes' });
        }
    }

    async getCampaignAnalytics(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;
            const analytics = await marketingService.getCampaignAnalytics(campaignId);
            res.json(analytics);
        } catch (error) {
            logger.error('Erreur lors de la récupération des analytics:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des analytics' });
        }
    }

    async updateCampaign(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;
            const updateData = req.body;
            const updated = await marketingService.updateCampaign(campaignId, updateData);
            res.json(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour de la campagne:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour de la campagne' });
        }
    }

    async deleteCampaign(req: Request, res: Response) {
        try {
            const { campaignId } = req.params;
            await marketingService.deleteCampaign(campaignId);
            res.json({ message: 'Campagne supprimée avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la suppression de la campagne:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression de la campagne' });
        }
    }
} 