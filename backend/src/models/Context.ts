import { Schema, model, Document } from 'mongoose';

export interface IContext extends Document {
    sessionId: string;
    data: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    metadata?: {
        source: string;
        type: string;
        tags: string[];
    };
}

const ContextSchema = new Schema<IContext>({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    },
    metadata: {
        source: String,
        type: String,
        tags: [String]
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
ContextSchema.index({ sessionId: 1 });
ContextSchema.index({ updatedAt: -1 });

export default model<IContext>('Context', ContextSchema); 