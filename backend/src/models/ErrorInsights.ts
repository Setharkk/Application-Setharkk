import { Schema, model, Document } from 'mongoose';

interface ISolution {
    code: string;
    successRate: number;
    lastUsed: Date;
}

interface ILearningProgress {
    confidenceScore: number;
    iterations: number;
}

interface IDailyTrend {
    date: Date;
    count: number;
}

interface IWeeklyTrend {
    week: number;
    year: number;
    count: number;
}

interface ITrends {
    daily: IDailyTrend[];
    weekly: IWeeklyTrend[];
}

export interface IErrorInsights extends Document {
    pattern: string;
    occurrences: number;
    lastOccurrence: Date;
    solutions: ISolution[];
    learningProgress: ILearningProgress;
    recommendations: string[];
    trends: ITrends;
    generateRecommendations: () => string[];
    updateTrends: () => Promise<IErrorInsights>;
}

const errorInsightsSchema = new Schema<IErrorInsights>({
    pattern: {
        type: String,
        required: true,
        unique: true
    },
    occurrences: {
        type: Number,
        default: 0
    },
    lastOccurrence: {
        type: Date,
        default: Date.now
    },
    solutions: [{
        code: String,
        successRate: Number,
        lastUsed: Date
    }],
    learningProgress: {
        confidenceScore: {
            type: Number,
            default: 0
        },
        iterations: {
            type: Number,
            default: 0
        }
    },
    recommendations: [{
        type: String
    }],
    trends: {
        daily: [{
            date: Date,
            count: Number
        }],
        weekly: [{
            week: Number,
            year: Number,
            count: Number
        }]
    }
}, {
    timestamps: true
});

// Fonction utilitaire pour obtenir le numéro de la semaine
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Méthode pour générer des recommandations basées sur l'apprentissage
errorInsightsSchema.methods.generateRecommendations = function(): string[] {
    const baseRecommendations = [
        "Vérifiez la configuration",
        "Assurez-vous que tous les services sont en ligne",
        "Consultez les logs pour plus de détails"
    ];

    // Ajout de recommandations basées sur les solutions réussies
    const successfulSolutions = this.solutions
        .filter((s: ISolution) => s.successRate > 0.7)
        .map((s: ISolution) => `Solution suggérée: ${s.code}`);

    this.recommendations = [...baseRecommendations, ...successfulSolutions];
    return this.recommendations;
};

// Méthode pour mettre à jour les tendances
errorInsightsSchema.methods.updateTrends = function(): Promise<IErrorInsights> {
    const now = new Date();
    
    // Mise à jour des tendances journalières
    const todayTrend = this.trends.daily.find((t: IDailyTrend) => 
        t.date.toISOString().split('T')[0] === now.toISOString().split('T')[0]
    );

    if (todayTrend) {
        todayTrend.count += 1;
    } else {
        this.trends.daily.push({
            date: now,
            count: 1
        });
    }

    // Mise à jour des tendances hebdomadaires
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    const weeklyTrend = this.trends.weekly.find((t: IWeeklyTrend) => 
        t.week === currentWeek && t.year === currentYear
    );

    if (weeklyTrend) {
        weeklyTrend.count += 1;
    } else {
        this.trends.weekly.push({
            week: currentWeek,
            year: currentYear,
            count: 1
        });
    }

    // Mise à jour du compteur d'occurrences
    this.occurrences += 1;
    this.lastOccurrence = now;

    return this.save();
};

// Index pour améliorer les performances des requêtes
errorInsightsSchema.index({ pattern: 1 });
errorInsightsSchema.index({ lastOccurrence: -1 });
errorInsightsSchema.index({ occurrences: -1 });
errorInsightsSchema.index({ 'solutions.successRate': -1 });

export default model<IErrorInsights>('ErrorInsights', errorInsightsSchema); 