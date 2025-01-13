import { Schema, model, Document, Types } from 'mongoose';

export type ReportFrequency = 'daily' | 'weekly' | 'monthly';
export type ReportMetric = 'conversions' | 'engagement' | 'roi' | 'cpa' | 'keywords' | 'competitors';
export type ReportFormat = 'pdf' | 'excel' | 'html';

export interface IReport extends Document {
    name: string;
    frequency: ReportFrequency;
    metrics: ReportMetric[];
    recipients: string[];
    autoSend: boolean;
    format: ReportFormat;
    lastGenerated?: Date;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    shouldGenerate: () => boolean;
    getNextGenerationDate: () => Date;
}

const reportSchema = new Schema<IReport>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
    },
    metrics: [{
        type: String,
        enum: ['conversions', 'engagement', 'roi', 'cpa', 'keywords', 'competitors']
    }],
    recipients: [{
        type: String,
        required: true,
        validate: {
            validator: function(email: string): boolean {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: (props: { value: string }) => `${props.value} n'est pas une adresse email valide`
        }
    }],
    autoSend: {
        type: Boolean,
        default: true
    },
    format: {
        type: String,
        enum: ['pdf', 'excel', 'html'],
        default: 'pdf'
    },
    lastGenerated: {
        type: Date
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Méthode pour vérifier si un rapport doit être généré
reportSchema.methods.shouldGenerate = function(): boolean {
    if (!this.lastGenerated) return true;

    const now = new Date();
    const lastGen = new Date(this.lastGenerated);
    const weekDiff = Math.floor((now.getTime() - lastGen.getTime()) / (1000 * 60 * 60 * 24 * 7));

    switch (this.frequency) {
        case 'daily':
            return now.getDate() !== lastGen.getDate() ||
                   now.getMonth() !== lastGen.getMonth() ||
                   now.getFullYear() !== lastGen.getFullYear();
        case 'weekly':
            return weekDiff >= 1;
        case 'monthly':
            return now.getMonth() !== lastGen.getMonth() ||
                   now.getFullYear() !== lastGen.getFullYear();
        default:
            return false;
    }
};

// Méthode pour obtenir la prochaine date de génération
reportSchema.methods.getNextGenerationDate = function(): Date {
    const now = new Date();
    const next = new Date(now);

    switch (this.frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            next.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            next.setDate(next.getDate() + (7 - next.getDay()) + 1); // Prochain lundi
            next.setHours(0, 0, 0, 0);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            next.setDate(1);
            next.setHours(0, 0, 0, 0);
            break;
    }

    return next;
};

// Index pour améliorer les performances des requêtes
reportSchema.index({ createdBy: 1, frequency: 1 });
reportSchema.index({ autoSend: 1, frequency: 1 });
reportSchema.index({ lastGenerated: 1 });
reportSchema.index({ 'metrics': 1 });

export default model<IReport>('Report', reportSchema); 