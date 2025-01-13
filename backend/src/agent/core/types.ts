export interface ErrorContext {
    message: string;
    timestamp: Date;
    code?: string;
    details?: Record<string, unknown>;
}

export interface ContextEntry {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface Context {
    sessionId: string;
    userId?: string;
    timestamp: Date;
    history: ContextEntry[];
    state: Record<string, unknown>;
    errors?: ErrorContext[];
}

export interface ServiceAction {
    type: string;
    actionId: string;
    data: Record<string, unknown>;
    timestamp: Date;
} 