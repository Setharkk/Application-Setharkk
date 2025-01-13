import mongoose, { Schema, Document } from 'mongoose';

export interface IPattern extends Document {
    pattern: string;
    examples: string[];
    confidence: number;
    usageCount: number;
    lastUsed: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const PatternSchema = new Schema({
    pattern: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    examples: [{
        type: String,
        required: true
    }],
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default: 0.5
    },
    usageCount: {
        type: Number,
        required: true,
        default: 0
    },
    lastUsed: {
        type: Date,
        required: true,
        default: Date.now
    },
    metadata: {
        type: Map,
        of: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index pour la recherche rapide des patterns pertinents
PatternSchema.index({ confidence: -1, usageCount: -1 });

// Méthode pour mettre à jour les statistiques d'utilisation
PatternSchema.methods.updateUsage = function(success: boolean) {
    this.usageCount += 1;
    this.lastUsed = new Date();
    this.confidence = success 
        ? Math.min(this.confidence + 0.1, 1)
        : Math.max(this.confidence - 0.05, 0);
    return this.save();
};

// Méthode statique pour trouver les patterns pertinents
PatternSchema.statics.findRelevant = function(threshold: number = 0.7) {
    return this.find({
        confidence: { $gte: threshold },
        usageCount: { $gt: 0 }
    }).sort({ confidence: -1, usageCount: -1 });
};

export const Pattern = mongoose.model<IPattern>('Pattern', PatternSchema); 