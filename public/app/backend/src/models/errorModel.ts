import mongoose, { Document, Schema } from 'mongoose';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'validation' | 'data' | 'network' | 'auth' | 'system' | 'user' | 'other';

export interface ErrorEnvironment {
    route: string;
    method: string;
    headers: Record<string, any>;
    query: Record<string, any>;
    userAgent: string;
}

export interface ErrorState {
    previousActions: string[];
    relatedData: any;
    performance: {
        responseTime: number;
        memoryUsage: number;
    };
}

export interface ErrorAnalysis {
    errorFrequency: number;
    similarErrors: string[];
    impactLevel: ImpactLevel;
    category: ErrorCategory;
}

export interface ErrorContext {
    url?: string;
    pageData?: any;
    timestamp: Date;
    environment: ErrorEnvironment;
    state: ErrorState;
    analysis: ErrorAnalysis;
}

export interface ResolutionAttempt {
    date: Date;
    success: boolean;
    context: any;
}

export interface ErrorResolution {
    fixed: boolean;
    solution?: string;
    appliedAt?: Date;
    successRate: number;
    attempts: ResolutionAttempt[];
}

export interface IError extends Document {
    type: string;
    message: string;
    context: ErrorContext;
    resolution: ErrorResolution;
    occurrence: number;
    pattern: string;
}

export interface ErrorInsight {
    pattern: string;
    frequency: number;
    avgSuccessRate: number;
    bestSolutions: string[];
    commonContexts: Record<string, Set<any>>;
}

const errorSchema = new Schema<IError>({
    type: {
        type: String,
        required: true,
        index: true
    },
    message: String,
    context: {
        url: String,
        pageData: Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        },
        environment: {
            route: String,
            method: String,
            headers: Object,
            query: Object,
            userAgent: String
        },
        state: {
            previousActions: [String],
            relatedData: Schema.Types.Mixed,
            performance: {
                responseTime: Number,
                memoryUsage: Number
            }
        },
        analysis: {
            errorFrequency: Number,
            similarErrors: [String],
            impactLevel: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical']
            },
            category: {
                type: String,
                enum: ['validation', 'data', 'network', 'auth', 'system', 'user', 'other']
            }
        }
    },
    resolution: {
        fixed: {
            type: Boolean,
            default: false
        },
        solution: String,
        appliedAt: Date,
        successRate: {
            type: Number,
            default: 0
        },
        attempts: [{
            date: Date,
            success: Boolean,
            context: Schema.Types.Mixed
        }]
    },
    occurrence: {
        type: Number,
        default: 1
    },
    pattern: String
});

interface ErrorModel extends mongoose.Model<IError> {
    learnFromError(error: Error, context: Partial<ErrorContext>): Promise<string | null>;
    enrichContext(context: Partial<ErrorContext>): Promise<ErrorContext>;
    determineImpactLevel(context: Partial<ErrorContext>): ImpactLevel;
    determineErrorCategory(context: Partial<ErrorContext>): ErrorCategory;
    testSolution(solution: string, context: ErrorContext): Promise<boolean>;
    findSimilarErrors(pattern: string): Promise<string[]>;
    analyzePatterns(): Promise<ErrorInsight[] | null>;
    analyzeCommonContexts(contexts: ErrorContext[]): Record<string, Set<any>>;
}

// Méthode pour apprendre d'une erreur avec contexte enrichi
errorSchema.statics.learnFromError = async function(
    this: ErrorModel,
    error: Error,
    context: Partial<ErrorContext>
): Promise<string | null> {
    try {
        const errorPattern = this.identifyErrorPattern(error.message);
        const enrichedContext = await this.enrichContext(context);
        const existingError = await this.findOne({ pattern: errorPattern });

        if (existingError) {
            existingError.occurrence += 1;
            
            // Mettre à jour l'analyse
            existingError.context.analysis = {
                ...existingError.context.analysis,
                errorFrequency: existingError.occurrence / 
                    ((Date.now() - existingError.context.timestamp.getTime()) / (24 * 60 * 60 * 1000)),
                similarErrors: await this.findSimilarErrors(errorPattern)
            };

            // Si une solution existe, vérifier son taux de succès
            if (existingError.resolution.fixed && existingError.resolution.solution) {
                const success = await this.testSolution(existingError.resolution.solution, enrichedContext);
                existingError.resolution.attempts.push({
                    date: new Date(),
                    success,
                    context: enrichedContext
                });
                
                // Mettre à jour le taux de succès
                const totalAttempts = existingError.resolution.attempts.length;
                const successfulAttempts = existingError.resolution.attempts.filter(a => a.success).length;
                existingError.resolution.successRate = (successfulAttempts / totalAttempts) * 100;

                if (success) {
                    await existingError.save();
                    return existingError.resolution.solution;
                }
            }
            
            await existingError.save();
            return null;
        }

        // Créer une nouvelle erreur avec contexte enrichi
        await this.create({
            type: error.name || 'Unknown',
            message: error.message,
            context: enrichedContext,
            pattern: errorPattern
        });
        
        return null;
    } catch (err) {
        console.error('Erreur lors de l\'apprentissage:', err);
        return null;
    }
};

// Enrichir le contexte avec plus d'informations
errorSchema.statics.enrichContext = async function(
    this: ErrorModel,
    context: Partial<ErrorContext>
): Promise<ErrorContext> {
    const startTime = process.hrtime();
    const memUsage = process.memoryUsage();

    return {
        url: context.url,
        pageData: context.pageData,
        timestamp: new Date(),
        environment: {
            route: context.environment?.route || 'unknown',
            method: context.environment?.method || 'unknown',
            headers: context.environment?.headers || {},
            query: context.environment?.query || {},
            userAgent: context.environment?.userAgent || 'unknown'
        },
        state: {
            previousActions: context.state?.previousActions || [],
            relatedData: context.state?.relatedData || {},
            performance: {
                responseTime: process.hrtime(startTime)[1] / 1000000,
                memoryUsage: memUsage.heapUsed / 1024 / 1024
            }
        },
        analysis: {
            errorFrequency: 1,
            similarErrors: [],
            impactLevel: this.determineImpactLevel(context),
            category: this.determineErrorCategory(context)
        }
    };
};

// Déterminer le niveau d'impact
errorSchema.statics.determineImpactLevel = function(
    this: ErrorModel,
    context: Partial<ErrorContext>
): ImpactLevel {
    if (context.critical || context.security) return 'critical';
    if (context.userBlocking) return 'high';
    if (context.userExperience) return 'medium';
    return 'low';
};

// Déterminer la catégorie d'erreur
errorSchema.statics.determineErrorCategory = function(
    this: ErrorModel,
    context: Partial<ErrorContext>
): ErrorCategory {
    if (context.validation) return 'validation';
    if (context.data) return 'data';
    if (context.network) return 'network';
    if (context.auth) return 'auth';
    if (context.system) return 'system';
    if (context.user) return 'user';
    return 'other';
};

// Tester une solution
errorSchema.statics.testSolution = async function(
    this: ErrorModel,
    solution: string,
    context: ErrorContext
): Promise<boolean> {
    try {
        const result = await eval(solution);
        return !!result;
    } catch {
        return false;
    }
};

// Trouver des erreurs similaires
errorSchema.statics.findSimilarErrors = async function(
    this: ErrorModel,
    pattern: string
): Promise<string[]> {
    const similar = await this.find({
        pattern: { $regex: pattern.substring(0, Math.floor(pattern.length / 2)), $options: 'i' }
    }).limit(5).select('pattern');
    return similar.map(e => e.pattern);
};

// Analyser les motifs
errorSchema.statics.analyzePatterns = async function(
    this: ErrorModel
): Promise<ErrorInsight[] | null> {
    try {
        const errors = await this.find().sort('-occurrence').limit(100);
        const patterns: Record<string, {
            count: number;
            solutions: Set<string>;
            successRates: number[];
            contexts: ErrorContext[];
        }> = {};
        
        // Analyser les motifs récurrents
        errors.forEach(error => {
            const context = error.context;
            const key = `${context.environment.route}_${context.analysis.category}`;
            
            if (!patterns[key]) {
                patterns[key] = {
                    count: 0,
                    solutions: new Set(),
                    successRates: [],
                    contexts: []
                };
            }
            
            patterns[key].count++;
            if (error.resolution.solution) {
                patterns[key].solutions.add(error.resolution.solution);
                patterns[key].successRates.push(error.resolution.successRate);
            }
            patterns[key].contexts.push(context);
        });

        // Analyser et stocker les insights
        const insights = Object.entries(patterns).map(([key, data]) => ({
            pattern: key,
            frequency: data.count,
            avgSuccessRate: data.successRates.length ? 
                data.successRates.reduce((a, b) => a + b, 0) / data.successRates.length : 0,
            bestSolutions: Array.from(data.solutions),
            commonContexts: this.analyzeCommonContexts(data.contexts)
        }));

        // Sauvegarder les insights dans la base de données
        await mongoose.model('ErrorInsights').create(insights);
        
        return insights;
    } catch (err) {
        console.error('Erreur lors de l\'analyse des motifs:', err);
        return null;
    }
};

// Analyser les contextes communs
errorSchema.statics.analyzeCommonContexts = function(
    this: ErrorModel,
    contexts: ErrorContext[]
): Record<string, Set<any>> {
    const commonFeatures: Record<string, Set<any>> = {};
    
    contexts.forEach(context => {
        // Analyser les headers communs
        Object.entries(context.environment.headers).forEach(([key, value]) => {
            if (!commonFeatures[`header_${key}`]) {
                commonFeatures[`header_${key}`] = new Set();
            }
            commonFeatures[`header_${key}`].add(value);
        });

        // Analyser les paramètres de requête communs
        Object.entries(context.environment.query).forEach(([key, value]) => {
            if (!commonFeatures[`query_${key}`]) {
                commonFeatures[`query_${key}`] = new Set();
            }
            commonFeatures[`query_${key}`].add(value);
        });

        // Analyser les actions précédentes communes
        context.state.previousActions.forEach(action => {
            if (!commonFeatures['previous_actions']) {
                commonFeatures['previous_actions'] = new Set();
            }
            commonFeatures['previous_actions'].add(action);
        });
    });

    return commonFeatures;
};

export const Error = mongoose.model<IError, ErrorModel>('Error', errorSchema); 