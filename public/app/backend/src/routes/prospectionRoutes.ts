import express, { Request, Response, NextFunction } from 'express';
import { Prospection, IProspection } from '../models/prospectionModel';
import { AppError } from '../errors/appError';

const router = express.Router();

interface ProspectData {
    prospect: {
        secteur: string;
        technologie_actuelle?: string;
        points_douleur: string[];
        besoins_identifies?: string[];
    };
    script_personnalise?: string;
    scoring: {
        score_total: number;
        potentiel: number;
    };
    interactions: Array<{
        type: string;
        date: Date;
        contenu: string;
        details?: any;
    }>;
    suivi: {
        statut: 'en discussion' | 'proposition' | 'négociation' | 'gagné' | 'perdu';
    };
    intelligence: {
        patterns_succes: Array<{
            element: string;
            taux_succes: number;
            contexte: string;
        }>;
        mots_cles_efficaces: Array<{
            mot: string;
            impact: number;
            contexte: string;
        }>;
        moments_optimaux: Array<{
            jour_semaine: string;
            heure: number;
            taux_reponse: number;
        }>;
    };
}

interface AnalyseSectorielle {
    tendances: {
        technologies: Array<{ technologie: string; adoption: number }>;
        defis: Array<{ defi: string; frequence: number }>;
        priorites: Array<{ priorite: string; importance: number }>;
    };
    interoperabilite: {
        systemes_legacy: string[];
        points_integration: Array<{ point: string; frequence: number }>;
        niveaux_urgence: Array<{ niveau: string; pourcentage: number }>;
    };
    transformation_numerique: {
        maturite: {
            debutant: number;
            intermediaire: number;
            avance: number;
        };
        initiatives: Map<string, number>;
        obstacles: Map<string, number>;
    };
    recommendations: Array<{
        type: string;
        description: string;
        priorite: string;
    }>;
}

// Créer un nouveau prospect
router.post('/prospects', async (req: Request, res: Response) => {
    try {
        const prospect = new Prospection(req.body);
        await prospect.personnaliserScript();
        await prospect.calculerScoring();
        await prospect.save();

        res.json({
            success: true,
            prospect: {
                info: prospect.prospect,
                script: prospect.script_personnalise,
                scoring: prospect.scoring
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création du prospect",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

// Obtenir le script personnalisé pour un appel
router.get('/prospects/:id/script', async (req: Request, res: Response) => {
    try {
        const prospect = await Prospection.findById(req.params.id);
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: "Prospect non trouvé"
            });
        }

        await prospect.personnaliserScript();
        
        const meilleurMoment = prospect.analyserMomentOptimal();

        res.json({
            success: true,
            script: prospect.script_personnalise,
            meilleur_moment: meilleurMoment[0],
            insights: prospect.intelligence
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération du script",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

// Enregistrer une interaction
router.post('/prospects/:id/interactions', async (req: Request, res: Response) => {
    try {
        const prospect = await Prospection.findById(req.params.id);
        if (!prospect) {
            return res.status(404).json({
                success: false,
                message: "Prospect non trouvé"
            });
        }

        prospect.interactions.push({
            ...req.body,
            date: new Date()
        });

        await prospect.calculerScoring();
        const insights = prospect.genererInsights();
        const prochaineAction = await prospect.suggererProchaineAction();

        await prospect.save();

        res.json({
            success: true,
            scoring: prospect.scoring,
            insights,
            prochaine_action: prochaineAction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'enregistrement de l'interaction",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

// Obtenir les insights de prospection
router.get('/insights', async (req: Request, res: Response) => {
    try {
        const prospects = await Prospection.find()
            .select('interactions intelligence scoring suivi')
            .sort('-interactions.date');

        const insights = {
            patterns_globaux: analyserPatternsGlobaux(prospects),
            mots_cles_efficaces: analyserMotsClesGlobaux(prospects),
            moments_optimaux: analyserMomentsOptimaux(prospects),
            taux_conversion: calculerTauxConversion(prospects),
            recommendations: genererRecommendationsGlobales(prospects)
        };

        res.json({
            success: true,
            insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des insights",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

// Obtenir les prospects prioritaires
router.get('/prospects/prioritaires', async (req: Request, res: Response) => {
    try {
        const prospects = await Prospection.find({
            'scoring.score_total': { $gt: 70 },
            'suivi.statut': { $nin: ['gagné', 'perdu'] }
        })
        .sort('-scoring.score_total')
        .limit(10);

        const prospectsEnriches = await Promise.all(
            prospects.map(async (prospect) => {
                const prochaineAction = await prospect.suggererProchaineAction();
                return {
                    info: prospect.prospect,
                    scoring: prospect.scoring,
                    derniere_interaction: prospect.interactions[prospect.interactions.length - 1],
                    prochaine_action: prochaineAction
                };
            })
        );

        res.json({
            success: true,
            prospects: prospectsEnriches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des prospects prioritaires",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

// Obtenir l'analyse sectorielle industrielle
router.get('/analyse-sectorielle', async (req: Request, res: Response) => {
    try {
        const prospects = await Prospection.find({
            'prospect.secteur': { $in: ['manufacturing', 'energie', 'automobile', 'industrie'] }
        });

        const analyseSectorielle: AnalyseSectorielle = {
            tendances: analyserTendancesIndustrie(prospects),
            interoperabilite: analyserBesoinsInteroperabilite(prospects),
            transformation_numerique: analyserTransformationNumerique(prospects),
            recommendations: genererRecommendationsSectorielles(prospects)
        };

        res.json({
            success: true,
            analyse: analyseSectorielle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'analyse sectorielle",
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

// Fonctions utilitaires
function analyserPatternsGlobaux(prospects: IProspection[]): Array<{ element: string; taux_succes_moyen: number; contextes: string[] }> {
    const patterns: Record<string, { succes: number; total: number; contextes: Set<string> }> = {};
    
    prospects.forEach(prospect => {
        prospect.intelligence.patterns_succes.forEach(pattern => {
            if (!patterns[pattern.element]) {
                patterns[pattern.element] = {
                    succes: 0,
                    total: 0,
                    contextes: new Set()
                };
            }
            patterns[pattern.element].succes += pattern.taux_succes;
            patterns[pattern.element].total += 1;
            patterns[pattern.element].contextes.add(pattern.contexte);
        });
    });

    return Object.entries(patterns).map(([element, data]) => ({
        element,
        taux_succes_moyen: data.succes / data.total,
        contextes: Array.from(data.contextes)
    }));
}

function analyserMotsClesGlobaux(prospects: IProspection[]): Array<{ mot: string; impact_moyen: number; contextes: string[] }> {
    const motsCles: Record<string, { impact_total: number; occurrences: number; contextes: Set<string> }> = {};
    
    prospects.forEach(prospect => {
        prospect.intelligence.mots_cles_efficaces.forEach(mot => {
            if (!motsCles[mot.mot]) {
                motsCles[mot.mot] = {
                    impact_total: 0,
                    occurrences: 0,
                    contextes: new Set()
                };
            }
            motsCles[mot.mot].impact_total += mot.impact;
            motsCles[mot.mot].occurrences += 1;
            motsCles[mot.mot].contextes.add(mot.contexte);
        });
    });

    return Object.entries(motsCles)
        .map(([mot, data]) => ({
            mot,
            impact_moyen: data.impact_total / data.occurrences,
            contextes: Array.from(data.contextes)
        }))
        .sort((a, b) => b.impact_moyen - a.impact_moyen);
}

function analyserMomentsOptimaux(prospects: IProspection[]): Array<{ moment: string; taux_reponse_moyen: number }> {
    const moments: Record<string, { taux_total: number; count: number }> = {};
    
    prospects.forEach(prospect => {
        prospect.intelligence.moments_optimaux.forEach(moment => {
            const key = `${moment.jour_semaine}-${moment.heure}`;
            if (!moments[key]) {
                moments[key] = {
                    taux_total: 0,
                    count: 0
                };
            }
            moments[key].taux_total += moment.taux_reponse;
            moments[key].count += 1;
        });
    });

    return Object.entries(moments)
        .map(([moment, data]) => ({
            moment,
            taux_reponse_moyen: data.taux_total / data.count
        }))
        .sort((a, b) => b.taux_reponse_moyen - a.taux_reponse_moyen);
}

function calculerTauxConversion(prospects: IProspection[]): { 
    taux_conversion: number; 
    taux_progression: number; 
    details: { 
        total: number; 
        convertis: number; 
        en_cours: number; 
    }; 
} {
    const total = prospects.length;
    const convertis = prospects.filter(p => p.suivi.statut === 'gagné').length;
    const enCours = prospects.filter(p => 
        ['en discussion', 'proposition', 'négociation'].includes(p.suivi.statut)
    ).length;

    return {
        taux_conversion: (convertis / total) * 100,
        taux_progression: (enCours / total) * 100,
        details: {
            total,
            convertis,
            en_cours: enCours
        }
    };
}

function genererRecommendationsGlobales(prospects: IProspection[]): Array<{
    type: string;
    description: string;
    priorite: string;
}> {
    const patterns = analyserPatternsGlobaux(prospects);
    const motsCles = analyserMotsClesGlobaux(prospects);
    const moments = analyserMomentsOptimaux(prospects);
    const conversion = calculerTauxConversion(prospects);

    const recommendations = [];

    if (patterns.length > 0) {
        recommendations.push({
            type: 'pattern',
            description: `Utiliser l'approche "${patterns[0].element}" qui a un taux de succès de ${Math.round(patterns[0].taux_succes_moyen)}%`,
            priorite: 'haute'
        });
    }

    if (motsCles.length > 0) {
        recommendations.push({
            type: 'langage',
            description: `Intégrer les mots-clés à fort impact: ${motsCles.slice(0, 3).map(m => m.mot).join(', ')}`,
            priorite: 'moyenne'
        });
    }

    if (moments.length > 0) {
        recommendations.push({
            type: 'timing',
            description: `Privilégier les appels le ${moments[0].moment.split('-')[0]} à ${moments[0].moment.split('-')[1]}h`,
            priorite: 'haute'
        });
    }

    if (conversion.taux_conversion < 20) {
        recommendations.push({
            type: 'conversion',
            description: 'Améliorer le taux de conversion en renforçant le suivi des prospects en discussion',
            priorite: 'urgente'
        });
    }

    return recommendations;
}

export default router; 