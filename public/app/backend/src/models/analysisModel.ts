import mongoose, { Document, Schema } from 'mongoose';

export interface MetaTags {
    title?: string;
    description?: string;
    keywords?: string[];
}

export interface Headings {
    h1?: string[];
    h2?: string[];
    h3?: string[];
}

export interface Image {
    src: string;
    alt?: string;
    optimized: boolean;
}

export interface Performance {
    loadTime: number;
    score: number;
}

export interface Suggestion {
    type: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
}

export interface Keyword {
    word: string;
    density: number;
    relevance: number;
}

export interface Change {
    field: string;
    oldValue: any;
    newValue: any;
}

export interface HistoryEntry {
    date: Date;
    changes: Change[];
}

export interface IAnalysis extends Document {
    url: string;
    timestamp: Date;
    metaTags: MetaTags;
    headings: Headings;
    images: Image[];
    performance: Performance;
    seoScore: number;
    suggestions: Suggestion[];
    keywords: Keyword[];
    history: HistoryEntry[];
}

const analysisSchema = new Schema<IAnalysis>({
    url: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metaTags: {
        title: String,
        description: String,
        keywords: [String]
    },
    headings: {
        h1: [String],
        h2: [String],
        h3: [String]
    },
    images: [{
        src: String,
        alt: String,
        optimized: Boolean
    }],
    performance: {
        loadTime: Number,
        score: Number
    },
    seoScore: {
        type: Number,
        min: 0,
        max: 100
    },
    suggestions: [{
        type: String,
        priority: {
            type: String,
            enum: ['high', 'medium', 'low']
        },
        description: String
    }],
    keywords: [{
        word: String,
        density: Number,
        relevance: Number
    }],
    history: [{
        date: Date,
        changes: [{
            field: String,
            oldValue: Schema.Types.Mixed,
            newValue: Schema.Types.Mixed
        }]
    }]
});

// Indexation pour des recherches rapides
analysisSchema.index({ url: 1, timestamp: -1 });
analysisSchema.index({ 'keywords.word': 1 });
analysisSchema.index({ seoScore: -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', analysisSchema); 