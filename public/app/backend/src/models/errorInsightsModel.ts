import mongoose, { Document, Schema } from 'mongoose';

export interface Performance {
    responseTime: {
        avg: number;
        threshold: number;
    };
    memoryUsage: {
        avg: number;
        threshold: number;
    };
}

export interface CommonContexts {
    headers: Record<string, any>;
    actions: string[];
    performance: Performance;
}

export interface DailyTrend {
    date: Date;
    count: number;
    successRate: number;
}

export interface WeeklyTrend {
    week: string;
    count: number;
    successRate: number;
}

export interface MonthlyTrend {
    month: string;
    count: number;
    successRate: number;
}

export interface Trends {
    daily: DailyTrend[];
    weekly: WeeklyTrend[];
    monthly: MonthlyTrend[];
}

export interface Recommendation {
    type: string;
    description: string;
    confidence: number;
    implementationDetails: string;
    appliedCount: number;
    successRate: number;
}

export interface LearningProgress {
    dataPoints: number;
    confidenceScore: number;
    lastUpdate: Date;
    improvementRate: number;
}

export interface IErrorInsights extends Document {
    pattern: string;
    frequency: number;
    avgSuccessRate: number;
    bestSolutions: string[];
    commonContexts: CommonContexts;
    trends: Trends;
    recommendations: Recommendation[];
    learningProgress: LearningProgress;
    updateTrends(): Promise<void>;
    calculateConfidenceScore(): number;
    calculateTrendWeight(): number;
    calculateImprovementRate(): number;
    generateRecommendations(): void;
}

const errorInsightsSchema = new Schema<IErrorInsights>({
    pattern: {
        type: String,
        required: true,
        index: true
    },
    frequency: Number,
    avgSuccessRate: Number,
    bestSolutions: [String],
    commonContexts: {
        headers: Schema.Types.Mixed,
        actions: [String],
        performance: {
            responseTime: {
                avg: Number,
                threshold: Number
            },
            memoryUsage: {
                avg: Number,
                threshold: Number
            }
        }
    },
    trends: {
        daily: [{
            date: Date,
            count: Number,
            successRate: Number
        }],
        weekly: [{
            week: String,
            count: Number,
            successRate: Number
        }],
        monthly: [{
            month: String,
            count: Number,
            successRate: Number
        }]
    },
    recommendations: [{
        type: String,
        description: String,
        confidence: Number,
        implementationDetails: String,
        appliedCount: {
            type: Number,
            default: 0
        },
        successRate: {
            type: Number,
            default: 0
        }
    }],
    learningProgress: {
        dataPoints: Number,
        confidenceScore: Number,
        lastUpdate: Date,
        improvementRate: Number
    }
});

// Mettre à jour les tendances
errorInsightsSchema.methods.updateTrends = async function(this: IErrorInsights): Promise<void> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
    const thisMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

    // Mettre à jour les tendances quotidiennes
    const dailyTrend = this.trends.daily.find(t => t.date.getTime() === today.getTime());
    if (!dailyTrend) {
        this.trends.daily.push({
            date: today,
            count: 1,
            successRate: this.avgSuccessRate
        });
    } else {
        dailyTrend.count++;
        dailyTrend.successRate = (dailyTrend.successRate + this.avgSuccessRate) / 2;
    }

    // Mettre à jour les tendances hebdomadaires
    const weeklyTrend = this.trends.weekly.find(t => t.week === thisWeek);
    if (!weeklyTrend) {
        this.trends.weekly.push({
            week: thisWeek,
            count: 1,
            successRate: this.avgSuccessRate
        });
    } else {
        weeklyTrend.count++;
        weeklyTrend.successRate = (weeklyTrend.successRate + this.avgSuccessRate) / 2;
    }

    // Mettre à jour les tendances mensuelles
    const monthlyTrend = this.trends.monthly.find(t => t.month === thisMonth);
    if (!monthlyTrend) {
        this.trends.monthly.push({
            month: thisMonth,
            count: 1,
            successRate: this.avgSuccessRate
        });
    } else {
        monthlyTrend.count++;
        monthlyTrend.successRate = (monthlyTrend.successRate + this.avgSuccessRate) / 2;
    }

    // Mettre à jour le progrès d'apprentissage
    this.learningProgress.dataPoints++;
    this.learningProgress.lastUpdate = now;
    this.learningProgress.confidenceScore = this.calculateConfidenceScore();
    this.learningProgress.improvementRate = this.calculateImprovementRate();

    await this.save();
};

// Calculer le score de confiance
errorInsightsSchema.methods.calculateConfidenceScore = function(this: IErrorInsights): number {
    const dataPointsWeight = Math.min(this.learningProgress.dataPoints / 100, 1) * 0.4;
    const successRateWeight = (this.avgSuccessRate / 100) * 0.4;
    const trendWeight = this.calculateTrendWeight() * 0.2;
    
    return (dataPointsWeight + successRateWeight + trendWeight) * 100;
};

// Calculer le poids des tendances
errorInsightsSchema.methods.calculateTrendWeight = function(this: IErrorInsights): number {
    if (!this.trends.daily.length) return 0;
    
    const recentTrends = this.trends.daily.slice(-7);
    const successRates = recentTrends.map(t => t.successRate);
    const trend = successRates.reduce((a, b) => a + b, 0) / successRates.length;
    
    return trend / 100;
};

// Calculer le taux d'amélioration
errorInsightsSchema.methods.calculateImprovementRate = function(this: IErrorInsights): number {
    if (this.trends.daily.length < 2) return 0;
    
    const recent = this.trends.daily.slice(-7);
    const oldRate = recent[0].successRate;
    const newRate = recent[recent.length - 1].successRate;
    
    return ((newRate - oldRate) / oldRate) * 100;
};

// Générer des recommandations
errorInsightsSchema.methods.generateRecommendations = function(this: IErrorInsights): void {
    const recommendations: Recommendation[] = [];
    
    // Analyser les performances
    if (this.commonContexts.performance.responseTime.avg > 1000) {
        recommendations.push({
            type: 'performance',
            description: 'Les temps de réponse sont élevés',
            confidence: 0.8,
            implementationDetails: 'Optimiser les requêtes et ajouter du caching',
            appliedCount: 0,
            successRate: 0
        });
    }
    
    // Analyser les patterns d'erreur
    if (this.frequency > 10 && this.avgSuccessRate < 50) {
        recommendations.push({
            type: 'error_handling',
            description: 'Erreur fréquente avec faible taux de succès',
            confidence: 0.9,
            implementationDetails: 'Implémenter une gestion d\'erreur plus robuste',
            appliedCount: 0,
            successRate: 0
        });
    }
    
    // Analyser les actions utilisateur
    const userActions = this.commonContexts.actions;
    if (userActions.length > 3) {
        recommendations.push({
            type: 'user_experience',
            description: 'Séquence d\'actions utilisateur complexe',
            confidence: 0.7,
            implementationDetails: 'Simplifier le flux utilisateur',
            appliedCount: 0,
            successRate: 0
        });
    }
    
    this.recommendations = recommendations;
};

export const ErrorInsights = mongoose.model<IErrorInsights>('ErrorInsights', errorInsightsSchema); 