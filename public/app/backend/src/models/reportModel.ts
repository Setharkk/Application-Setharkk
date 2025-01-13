import mongoose, { Schema } from 'mongoose';
import { IReport } from '../types/models';

const reportSchema = new Schema({
    name: { type: String, required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    metrics: [{ type: String }],
    recipients: [{ type: String }],
    autoSend: { type: Boolean, default: false },
    format: { type: String, required: true },
    lastGenerated: { type: Date }
}, {
    timestamps: true
});

export const Report = mongoose.model<IReport>('Report', reportSchema);
export { IReport }; 