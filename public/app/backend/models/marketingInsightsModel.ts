import mongoose, { Document, Schema, Model } from 'mongoose';

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

interface IMarketingInsights extends Document {
  campaignId: mongoose.Types.ObjectId;
  metrics: IMetrics;
  demographics: IDemographics;
  engagementMetrics: IEngagementMetrics;
  createdAt: Date;
  updatedAt: Date;
  addDemographicData: (data: Partial<IDemographics>) => Promise<IMarketingInsights>;
  updateEngagementMetrics: (metrics: Partial<IEngagementMetrics>) => Promise<IMarketingInsights>;
}

interface IMarketingInsightsModel extends Model<IMarketingInsights> {
  findByCampaignId: (campaignId: mongoose.Types.ObjectId) => Promise<IMarketingInsights | null>;
  updateMetrics: (campaignId: mongoose.Types.ObjectId, metrics: Partial<IMetrics>) => Promise<IMarketingInsights>;
}

const marketingInsightsSchema = new Schema({
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pre-save pour mettre à jour updatedAt
marketingInsightsSchema.pre('save', function(this: IMarketingInsights, next: () => void): void {
  this.updatedAt = new Date();
  next();
});

// Méthodes statiques
marketingInsightsSchema.statics.findByCampaignId = function(
  campaignId: mongoose.Types.ObjectId
): Promise<IMarketingInsights | null> {
  return this.findOne({ campaignId });
};

marketingInsightsSchema.statics.updateMetrics = async function(
  campaignId: mongoose.Types.ObjectId,
  metrics: Partial<IMetrics>
): Promise<IMarketingInsights> {
  return this.findOneAndUpdate(
    { campaignId },
    { $set: { metrics, updatedAt: new Date() } },
    { new: true, upsert: true }
  );
};

// Méthodes d'instance
marketingInsightsSchema.methods.addDemographicData = function(
  this: IMarketingInsights,
  data: Partial<IDemographics>
): Promise<IMarketingInsights> {
  this.demographics = { ...this.demographics, ...data };
  return this.save();
};

marketingInsightsSchema.methods.updateEngagementMetrics = function(
  this: IMarketingInsights,
  metrics: Partial<IEngagementMetrics>
): Promise<IMarketingInsights> {
  this.engagementMetrics = { ...this.engagementMetrics, ...metrics };
  return this.save();
};

export const MarketingInsights = mongoose.model<IMarketingInsights, IMarketingInsightsModel>(
  'MarketingInsights',
  marketingInsightsSchema
); 