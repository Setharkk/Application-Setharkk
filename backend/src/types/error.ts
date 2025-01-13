export interface ErrorData {
    id?: string;
    message: string;
    stack?: string;
    severity: 'low' | 'medium' | 'high';
    status: ErrorStatus;
    timestamp: Date;
    updatedAt?: Date;
    resolution?: string;
    source?: string;
    context?: Record<string, unknown>;
}

export type ErrorStatus = 'new' | 'investigating' | 'resolved' | 'closed';

export interface ErrorFilter {
    severity?: ErrorData['severity'];
    status?: ErrorStatus;
    startDate?: Date;
    endDate?: Date;
}

export interface ErrorStats {
    total: number;
    bySeverity: Record<ErrorData['severity'], number>;
    byStatus: Record<ErrorStatus, number>;
    trend: { date: Date; count: number }[];
} 