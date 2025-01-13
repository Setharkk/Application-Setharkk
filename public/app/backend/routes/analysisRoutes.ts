import { Router, Request, Response } from 'express';

interface PerformanceData {
    score?: number;
    loadTime?: string;
    fcp?: string;
    speedIndex?: string;
    recommendations?: string[];
}

interface PerformanceMetrics {
    loadTime: string;
    firstContentfulPaint: string;
    speedIndex: string;
}

interface PerformanceAnalysis {
    performance: {
        score: number;
        metrics: PerformanceMetrics;
    };
    recommendations: string[];
}

interface SecurityAnalysis {
    url: string;
    security: {
        score: number;
        checks: {
            ssl: string;
            headers: string;
            vulnerabilities: string;
        };
    };
    recommendations: string[];
}

interface AnalysisResponse<T> {
    error?: string;
    data?: T;
}

const router = Router();

router.post('/performance', async (req: Request<{}, {}, { data?: PerformanceData }>, res: Response) => {
    try {
        const { data } = req.body;
        const analysis: PerformanceAnalysis = {
            performance: {
                score: data?.score || 85,
                metrics: {
                    loadTime: data?.loadTime || "2.3s",
                    firstContentfulPaint: data?.fcp || "1.2s",
                    speedIndex: data?.speedIndex || "2.5s"
                }
            },
            recommendations: data?.recommendations || [
                "Optimisez les images",
                "Utilisez la mise en cache",
                "Minimisez les ressources"
            ]
        };
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as AnalysisResponse<never>);
    }
});

router.post('/security', async (req: Request<{}, {}, { url: string }>, res: Response) => {
    try {
        const { url } = req.body;
        const analysis: SecurityAnalysis = {
            url,
            security: {
                score: 90,
                checks: {
                    ssl: "Valid",
                    headers: "Secure",
                    vulnerabilities: "None detected"
                }
            },
            recommendations: [
                "Activez HTTPS",
                "Mettez à jour les dépendances",
                "Configurez les en-têtes de sécurité"
            ]
        };
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        } as AnalysisResponse<never>);
    }
});

export default router; 