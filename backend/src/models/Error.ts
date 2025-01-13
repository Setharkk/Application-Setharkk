import { Schema, model, Document } from 'mongoose';

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface IError extends Document {
    message: string;
    code: string;
    stack?: string;
    timestamp: Date;
    service: string;
    severity: ErrorSeverity;
    context?: Record<string, unknown>;
}

const errorSchema = new Schema<IError>({
    message: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    stack: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    service: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        default: 'ERROR'
    },
    context: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
errorSchema.index({ timestamp: -1 });
errorSchema.index({ service: 1, severity: 1 });
errorSchema.index({ code: 1 });

export default model<IError>('Error', errorSchema); 