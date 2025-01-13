import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    analysis?: {
        intent: string;
        sentiment: {
            score: number;
            label: string;
        };
        entities: Record<string, unknown>;
    };
    suggestions?: string[];
}

const MessageSchema = new Schema<IMessage>({
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
    },
    suggestions: [String]
});

export default model<IMessage>('Message', MessageSchema); 