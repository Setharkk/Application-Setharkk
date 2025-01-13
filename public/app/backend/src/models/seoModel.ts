import mongoose, { Document, Schema } from 'mongoose';

export interface MetaAnalysis {
    description: string;
    keywords: string[];
    score: number;
    recommendations: string[];
}

export interface TitleAnalysis {
    content: string;
    score: number;
    recommendations: string[];
}

export interface PerformanceAnalysis {
    loadTime: string;
    speedIndex: string;
    score: number;
    recommendations: string[];
}

export interface Analysis {
    title: TitleAnalysis;
    meta: MetaAnalysis;
    performance: PerformanceAnalysis;
}

export interface ISEO extends Document {
    url: string;
    score: number;
    analysis: Analysis;
    recommendations: string[];
    createdAt: Date;
    updatedAt: Date;
}

const seoSchema = new Schema<ISEO>({
    url: {
        type: String,
        required: true,
        trim: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    analysis: {
        title: {
            content: String,
            score: Number,
            recommendations: [String]
        },
        meta: {
            description: String,
            keywords: [String],
            score: Number,
            recommendations: [String]
        },
        performance: {
            loadTime: String,
            speedIndex: String,
            score: Number,
            recommendations: [String]
        }
    },
    recommendations: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

seoSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const SEO = mongoose.model<ISEO>('SEO', seoSchema); 