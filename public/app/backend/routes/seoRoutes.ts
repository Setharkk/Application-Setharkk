import { Router, Request, Response } from 'express';
import { seoController } from '../controllers/seoController';

interface AnalyzeRequest {
    url: string;
}

interface OptimizeRequest {
    url: string;
    currentData: any; // À typer plus précisément selon la structure des données
}

interface SEOResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

const router = Router();

router.post('/analyze', async (req: Request<{}, {}, AnalyzeRequest>, res: Response) => {
    try {
        const { url } = req.body;
        const analysis = await seoController.analyzePage(url);
        res.json({
            success: true,
            data: analysis
        } as SEOResponse<typeof analysis>);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as SEOResponse<never>);
    }
});

router.post('/optimize', async (req: Request<{}, {}, OptimizeRequest>, res: Response) => {
    try {
        const { url, currentData } = req.body;
        const optimization = await seoController.optimizePage(url, currentData);
        res.json({
            success: true,
            data: optimization
        } as SEOResponse<typeof optimization>);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as SEOResponse<never>);
    }
});

export default router; 