import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMemory extends Document {
    _id: Types.ObjectId;
    content: string;
    type: 'fact' | 'preference' | 'context' | 'interaction';
    timestamp: Date;
    relevance: number;
    analysis: {
        summary: string;
        keywords: string[];
        entities: Record<string, any>;
        sentiment: {
            score: number;
            label: string;
        };
    };
    metadata?: Record<string, any>;
}

const MemorySchema = new Schema({
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['fact', 'preference', 'context', 'interaction'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    relevance: {
        type: Number,
        default: 1.0,
        min: 0,
        max: 1
    },
    analysis: {
        summary: String,
        keywords: [String],
        entities: Schema.Types.Mixed,
        sentiment: {
            score: Number,
            label: String
        }
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index pour la recherche full-text
MemorySchema.index({ content: 'text', 'analysis.summary': 'text' });

// Index pour la recherche par type et pertinence
MemorySchema.index({ type: 1, relevance: -1 });

// Index pour la recherche par mots-clés
MemorySchema.index({ 'analysis.keywords': 1 });

// Index pour le tri temporel
MemorySchema.index({ timestamp: -1 });

// Méthode pour mettre à jour la pertinence
MemorySchema.methods.updateRelevance = function(decayFactor: number) {
    this.relevance *= decayFactor;
    return this.relevance;
};

// Méthode pour vérifier si la mémoire est pertinente
MemorySchema.methods.isRelevant = function(threshold: number) {
    return this.relevance >= threshold;
};

export default mongoose.model<IMemory>('Memory', MemorySchema); 