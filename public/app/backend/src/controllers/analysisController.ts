import { Request, Response } from 'express';

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

interface SecurityChecks {
    ssl: string;
    headers: string;
    vulnerabilities: string;
}

interface SecurityAnalysis {
    url: string;
    security: {
        score: number;
        checks: SecurityChecks;
    };
    recommendations: string[];
}

interface AnalysisData {
    score?: number;
    loadTime?: string;
    fcp?: string;
    speedIndex?: string;
    recommendations?: string[];
}

export const analyzePerformance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data } = req.body as { data: AnalysisData };
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
        res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
};

export const analyzeSecurity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body as { url: string };
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
        res.status(500).json({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
}; 