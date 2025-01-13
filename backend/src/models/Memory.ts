import { Schema, model, Document } from 'mongoose';

export interface IMemory extends Document {
    content: string;
    type: string;
    timestamp: Date;
    relevance: number;
    analysis: {
        keywords: string[];
        summary: string;
        sentiment: {
            score: number;
            label: string;
        };
    };
}

const MemorySchema = new Schema<IMemory>({
    content: { type: String, required: true },
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    relevance: { type: Number, required: true, min: 0, max: 1 },
    analysis: {
        keywords: [String],
        summary: String,
        sentiment: {
            score: Number,
            label: String
        }
    }
});

export default model<IMemory>('Memory', MemorySchema); 