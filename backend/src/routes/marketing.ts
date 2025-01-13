import { Router } from 'express';
import { MarketingController } from '../controllers/marketing.controller';

const router = Router();
const marketingController = new MarketingController();

// Routes pour les campagnes
router.post('/campaigns', marketingController.createCampaign);
router.get('/campaigns', marketingController.getCampaigns);
router.get('/campaigns/:campaignId/analytics', marketingController.getCampaignAnalytics);
router.put('/campaigns/:campaignId', marketingController.updateCampaign);
router.delete('/campaigns/:campaignId', marketingController.deleteCampaign);

export default router; 