export interface Service {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error';
    type: string;
    description?: string;
} 