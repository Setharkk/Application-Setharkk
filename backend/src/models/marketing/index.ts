import { Schema, model, Document, Types } from 'mongoose';

interface IMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface IAgeGroup {
  range: string;
  percentage: number;
}

interface IGender {
  type: string;
  percentage: number;
}

interface ILocation {
  name: string;
  count: number;
}

interface IDemographics {
  ageGroups: IAgeGroup[];
  genders: IGender[];
  locations: ILocation[];
}

interface IEngagementMetrics {
  averageTimeOnPage: number;
  bounceRate: number;
  socialShares: number;
}

export interface IMarketingInsights extends Document {
  campaignId: Types.ObjectId;
  metrics: IMetrics;
  demographics: IDemographics;
  engagementMetrics: IEngagementMetrics;
  createdAt: Date;
  updatedAt: Date;
  addDemographicData: (data: Partial<IDemographics>) => Promise<IMarketingInsights>;
  updateEngagementMetrics: (metrics: Partial<IEngagementMetrics>) => Promise<IMarketingInsights>;
}

const marketingInsightsSchema = new Schema<IMarketingInsights>({
  campaignId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Campaign'
  },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  demographics: {
    ageGroups: [{
      range: String,
      percentage: Number
    }],
    genders: [{
      type: String,
      percentage: Number
    }],
    locations: [{
      name: String,
      count: Number
    }]
  },
  engagementMetrics: {
    averageTimeOnPage: Number,
    bounceRate: Number,
    socialShares: Number
  }
}, {
  timestamps: true
});

// Méthodes d'instance
marketingInsightsSchema.methods.addDemographicData = function(
  data: Partial<IDemographics>
): Promise<IMarketingInsights> {
  this.demographics = { ...this.demographics, ...data };
  return this.save();
};

marketingInsightsSchema.methods.updateEngagementMetrics = function(
  metrics: Partial<IEngagementMetrics>
): Promise<IMarketingInsights> {
  this.engagementMetrics = { ...this.engagementMetrics, ...metrics };
  return this.save();
};

// Index pour améliorer les performances
marketingInsightsSchema.index({ campaignId: 1 });
marketingInsightsSchema.index({ 'metrics.conversions': -1 });
marketingInsightsSchema.index({ 'metrics.revenue': -1 });
marketingInsightsSchema.index({ createdAt: -1 });

export default model<IMarketingInsights>('MarketingInsights', marketingInsightsSchema); 