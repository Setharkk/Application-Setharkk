import mongoose, { Schema } from 'mongoose';
import { IMarketingInsights } from '../types/models';

const marketingInsightsSchema = new Schema({
    revenue: { type: Number, required: true },
    costs: { type: Number, required: true },
    acquisitions: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const MarketingInsights = mongoose.model<IMarketingInsights>('MarketingInsights', marketingInsightsSchema);
export { IMarketingInsights }; 