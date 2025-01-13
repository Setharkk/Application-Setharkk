import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    _id: Types.ObjectId;
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
    analysis?: {
        intent: string;
        sentiment: {
            score: number;
            label: string;
        };
        entities: Record<string, any>;
    };
    suggestions?: string[];
}

const MessageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    context: {
        type: Schema.Types.Mixed,
        default: {}
    },
    analysis: {
        intent: String,
        sentiment: {
            score: Number,
            label: String
        },
        entities: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index pour la recherche full-text
MessageSchema.index({ message: 'text' });

// Index pour la recherche par intention
MessageSchema.index({ 'analysis.intent': 1 });

// Index pour la recherche par sentiment
MessageSchema.index({ 'analysis.sentiment.label': 1 });

export default mongoose.model<IMessage>('Message', MessageSchema); 