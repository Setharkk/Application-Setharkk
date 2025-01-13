import { Document } from 'mongoose';

export interface IReport extends Document {
    _id: string;
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

export interface IErrorModel extends Document {
    message: string;
    code: string;
    stack?: string;
    service: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IErrorInsights extends Document {
    occurrences: number;
} 