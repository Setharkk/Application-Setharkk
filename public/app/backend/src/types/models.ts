import { Document } from 'mongoose';

export interface IReport extends Document {
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    metrics: string[];
    recipients: string[];
    autoSend: boolean;
    format: string;
    lastGenerated?: Date;
}

export interface IMarketingInsights extends Document {
    revenue: number;
    costs: number;
    acquisitions: number;
    createdAt: Date;
} 