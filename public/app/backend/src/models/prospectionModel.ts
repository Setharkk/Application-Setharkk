import mongoose, { Document, Schema } from 'mongoose';

export type Maturite = 'froid' | 'tiède' | 'chaud' | 'très chaud';
export type InteractionType = 'appel' | 'message' | 'email' | 'linkedin' | 'autre';
export type Sentiment = 'très négatif' | 'négatif' | 'neutre' | 'positif' | 'très positif';
export type ProspectStatus = 'nouveau' | 'contacté' | 'en discussion' | 'proposition' | 'négociation' | 'gagné' | 'perdu';
export type Priority = 'basse' | 'moyenne' | 'haute' | 'urgente';

export interface Prospect {
    nom?: string;
    entreprise?: string;
    poste?: string;
    secteur?: string;
    taille_entreprise?: string;
    localisation?: string;
    linkedin?: string;
    telephone?: string;
    email?: string;
    source?: string;
}

export interface Budget {
    fourchette?: string;
    cycle_decision?: string;
}

export interface DecisionMaker {
    nom: string;
    poste: string;
    influence: number; // 1-10
}

export interface Profilage {
    besoins_identifies?: string[];
    points_douleur?: string[];
    budget?: Budget;
    maturite?: Maturite;
    technologie_actuelle?: string;
    concurrents_utilises?: string[];
    decision_makers?: DecisionMaker[];
}

export interface Rappel {
    date: Date;
    note: string;
}

export interface Interaction {
    type: InteractionType;
    date: Date;
    contenu: string;
    reponse?: string;
    sentiment?: Sentiment;
    points_cles?: string[];
    next_steps?: string[];
    rappel?: Rappel;
}

export interface Objection {
    objection: string;
    reponse: string;
}

export interface SuccessStory {
    client: string;
    contexte: string;
    resultat: string;
}

export interface ScriptPersonnalise {
    accroche?: string;
    points_cles?: string[];
    objections_anticipees?: Objection[];
    proposition_valeur?: string;
    call_to_action?: string;
    success_stories?: SuccessStory[];
}

export interface ScoringFactor {
    nom: string;
    impact: number; // -5 à +5
    commentaire: string;
}

export interface Scoring {
    engagement: number; // 0-100
    potentiel: number; // 0-100
    probabilite_conversion: number; // 0-100
    score_total: number;
    facteurs: ScoringFactor[];
}

export interface StatusHistory {
    statut: ProspectStatus;
    date: Date;
    commentaire: string;
}

export interface NextAction {
    type: string;
    date: Date;
    description: string;
}

export interface Suivi {
    statut: ProspectStatus;
    historique_statuts: StatusHistory[];
    priorite: Priority;
    derniere_interaction?: Date;
    prochaine_action?: NextAction;
}

export interface SuccessPattern {
    element: string;
    taux_succes: number;
    contexte: string;
}

export interface KeywordImpact {
    mot: string;
    impact: number;
    contexte: string;
}

export interface OptimalTiming {
    jour_semaine: string;
    heure: string;
    taux_reponse: number;
}

export interface EfficientResponse {
    reponse: string;
    taux_succes: number;
}

export interface FrequentObjection {
    objection: string;
    frequence: number;
    reponses_efficaces: EfficientResponse[];
}

export interface Intelligence {
    patterns_succes: SuccessPattern[];
    mots_cles_efficaces: KeywordImpact[];
    moments_optimaux: OptimalTiming[];
    objections_frequentes: FrequentObjection[];
}

export interface SectorInsights {
    challenges: string[];
    tendances: string[];
    opportunites: string[];
}

export interface BehaviorInsights {
    preferences: string[];
    objections: string[];
    motivations: string[];
}

export interface IProspection extends Document {
    prospect: Prospect;
    profilage: Profilage;
    interactions: Interaction[];
    script_personnalise: ScriptPersonnalise;
    scoring: Scoring;
    suivi: Suivi;
    intelligence: Intelligence;
    personnaliserScript(): Promise<void>;
    analyserMomentOptimal(): { moment: string; taux_succes: number; }[];
    genererInsights(): {
        patterns: SuccessPattern[];
        mots_cles: KeywordImpact[];
        objections: FrequentObjection[];
        recommendations: string[];
    };
    calculerScoring(): void;
    suggererProchaineAction(): Promise<NextAction>;
    analyserSecteur(): Promise<SectorInsights>;
    analyserComportement(): Promise<BehaviorInsights>;
    genererAccroche(insights: SectorInsights): string;
    identifierPointsCles(insights: SectorInsights): string[];
    anticiperObjections(insights: BehaviorInsights): Objection[];
    personnaliserPropositionValeur(insights: SectorInsights): string;
    genererCallToAction(insights: BehaviorInsights): string;
    trouverSuccessStoriesPertinentes(): Promise<SuccessStory[]>;
    calculerEngagement(): { score: number; impact: number; commentaire: string; };
    evaluerPotentiel(): { score: number; impact: number; commentaire: string; };
    evaluerMaturite(): { score: number; impact: number; commentaire: string; };
    analyserPatternsSucces(): SuccessPattern[];
    analyserMotsClesEfficaces(): KeywordImpact[];
    analyserObjectionsFrequentes(): FrequentObjection[];
    genererRecommendations(): string[];
}

const prospectionSchema = new Schema<IProspection>({
    prospect: {
        nom: String,
        entreprise: String,
        poste: String,
        secteur: String,
        taille_entreprise: String,
        localisation: String,
        linkedin: String,
        telephone: String,
        email: String,
        source: String
    },
    profilage: {
        besoins_identifies: [String],
        points_douleur: [String],
        budget: {
            fourchette: String,
            cycle_decision: String
        },
        maturite: {
            type: String,
            enum: ['froid', 'tiède', 'chaud', 'très chaud']
        },
        technologie_actuelle: String,
        concurrents_utilises: [String],
        decision_makers: [{
            nom: String,
            poste: String,
            influence: Number
        }]
    },
    interactions: [{
        type: {
            type: String,
            enum: ['appel', 'message', 'email', 'linkedin', 'autre']
        },
        date: Date,
        contenu: String,
        reponse: String,
        sentiment: {
            type: String,
            enum: ['très négatif', 'négatif', 'neutre', 'positif', 'très positif']
        },
        points_cles: [String],
        next_steps: [String],
        rappel: {
            date: Date,
            note: String
        }
    }],
    script_personnalise: {
        accroche: String,
        points_cles: [String],
        objections_anticipees: [{
            objection: String,
            reponse: String
        }],
        proposition_valeur: String,
        call_to_action: String,
        success_stories: [{
            client: String,
            contexte: String,
            resultat: String
        }]
    },
    scoring: {
        engagement: Number,
        potentiel: Number,
        probabilite_conversion: Number,
        score_total: Number,
        facteurs: [{
            nom: String,
            impact: Number,
            commentaire: String
        }]
    },
    suivi: {
        statut: {
            type: String,
            enum: ['nouveau', 'contacté', 'en discussion', 'proposition', 'négociation', 'gagné', 'perdu']
        },
        historique_statuts: [{
            statut: String,
            date: Date,
            commentaire: String
        }],
        priorite: {
            type: String,
            enum: ['basse', 'moyenne', 'haute', 'urgente']
        },
        derniere_interaction: Date,
        prochaine_action: {
            type: String,
            date: Date,
            description: String
        }
    },
    intelligence: {
        patterns_succes: [{
            element: String,
            taux_succes: Number,
            contexte: String
        }],
        mots_cles_efficaces: [{
            mot: String,
            impact: Number,
            contexte: String
        }],
        moments_optimaux: [{
            jour_semaine: String,
            heure: String,
            taux_reponse: Number
        }],
        objections_frequentes: [{
            objection: String,
            frequence: Number,
            reponses_efficaces: [{
                reponse: String,
                taux_succes: Number
            }]
        }]
    }
});

// Méthode pour personnaliser le script d'appel
prospectionSchema.methods.personnaliserScript = async function(this: IProspection): Promise<void> {
    const secteurInsights = await this.analyserSecteur();
    const comportementInsights = await this.analyserComportement();
    
    this.script_personnalise = {
        accroche: this.genererAccroche(secteurInsights),
        points_cles: this.identifierPointsCles(secteurInsights),
        objections_anticipees: this.anticiperObjections(comportementInsights),
        proposition_valeur: this.personnaliserPropositionValeur(secteurInsights),
        call_to_action: this.genererCallToAction(comportementInsights),
        success_stories: await this.trouverSuccessStoriesPertinentes()
    };
};

// Méthode pour analyser le meilleur moment pour contacter
prospectionSchema.methods.analyserMomentOptimal = function(this: IProspection): { moment: string; taux_succes: number; }[] {
    const interactions = this.interactions.filter(i => i.reponse);
    const moments: Record<string, { total: number; positif: number; }> = {};

    interactions.forEach(interaction => {
        const date = new Date(interaction.date);
        const jour = date.toLocaleDateString('fr-FR', { weekday: 'long' });
        const heure = date.getHours();
        const key = `${jour}-${heure}`;

        if (!moments[key]) {
            moments[key] = { total: 0, positif: 0 };
        }

        moments[key].total++;
        if (['positif', 'très positif'].includes(interaction.sentiment || '')) {
            moments[key].positif++;
        }
    });

    return Object.entries(moments)
        .map(([moment, stats]) => ({
            moment,
            taux_succes: (stats.positif / stats.total) * 100
        }))
        .sort((a, b) => b.taux_succes - a.taux_succes);
};

// Méthode pour générer des insights basés sur les interactions
prospectionSchema.methods.genererInsights = function(this: IProspection): {
    patterns: SuccessPattern[];
    mots_cles: KeywordImpact[];
    objections: FrequentObjection[];
    recommendations: string[];
} {
    const insights = {
        patterns: this.analyserPatternsSucces(),
        mots_cles: this.analyserMotsClesEfficaces(),
        objections: this.analyserObjectionsFrequentes(),
        recommendations: this.genererRecommendations()
    };

    this.intelligence = {
        patterns_succes: insights.patterns,
        mots_cles_efficaces: insights.mots_cles,
        objections_frequentes: insights.objections,
        moments_optimaux: []
    };

    return insights;
};

// Méthode pour calculer le scoring
prospectionSchema.methods.calculerScoring = function(this: IProspection): void {
    const facteurs: ScoringFactor[] = [];
    let score = 0;

    // Engagement
    const engagement = this.calculerEngagement();
    facteurs.push({
        nom: 'Engagement',
        impact: engagement.impact,
        commentaire: engagement.commentaire
    });
    score += engagement.score;

    // Potentiel business
    const potentiel = this.evaluerPotentiel();
    facteurs.push({
        nom: 'Potentiel business',
        impact: potentiel.impact,
        commentaire: potentiel.commentaire
    });
    score += potentiel.score;

    // Maturité du prospect
    const maturite = this.evaluerMaturite();
    facteurs.push({
        nom: 'Maturité',
        impact: maturite.impact,
        commentaire: maturite.commentaire
    });
    score += maturite.score;

    this.scoring = {
        engagement: engagement.score,
        potentiel: potentiel.score,
        probabilite_conversion: score / 3,
        score_total: score,
        facteurs
    };
};

// Méthode pour suggérer la prochaine action
prospectionSchema.methods.suggererProchaineAction = async function(this: IProspection): Promise<NextAction> {
    const historique = this.interactions;
    const dernierContact = historique[historique.length - 1];
    const scoring = this.scoring;
    
    const action: NextAction = {
        type: '',
        date: new Date(),
        description: ''
    };

    if (scoring.score_total > 80) {
        action.type = 'proposition';
        action.description = 'Envoyer une proposition commerciale personnalisée';
    } else if (scoring.engagement > 70) {
        action.type = 'demo';
        action.description = 'Organiser une démonstration';
    } else if (!dernierContact || dernierContact.sentiment === 'neutre') {
        action.type = 'nurturing';
        action.description = 'Envoyer un contenu de nurturing personnalisé';
    }

    return action;
};

export const Prospection = mongoose.model<IProspection>('Prospection', prospectionSchema); 