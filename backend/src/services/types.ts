export interface EmailConfig {
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    from: string;
    elasticsearch: {
        node: string;
    };
    rabbitmq: {
        url: string;
    };
}

export interface SeoAnalysis {
    url: string;
    title: string;
    description: string;
    keywords: string[];
    score: number;
    recommendations: string[];
    timestamp: Date;
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    type: string;
    provider: 'boostspace' | 'make';
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkflowStep {
    id: string;
    name: string;
    type: string;
    config: Record<string, unknown>;
    nextSteps?: string[];
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
}

export interface AutomationExecution {
    id: string;
    workflowId: string;
    status: 'running' | 'completed' | 'failed';
    steps: Record<string, {
        status: 'pending' | 'running' | 'completed' | 'failed';
        startTime: Date;
        endTime?: Date;
        error?: string;
        output?: Record<string, unknown>;
    }>;
    startTime: Date;
    endTime?: Date;
    error?: {
        message: string;
        code?: string;
        details?: Record<string, unknown>;
    };
} 