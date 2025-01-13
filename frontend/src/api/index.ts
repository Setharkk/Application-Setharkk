import axios from 'axios';
import type { ApiInstance } from './types';

const api: ApiInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        if (error && typeof error === 'object' && 'response' in error) {
            return Promise.reject(new Error(error.message));
        }
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
);

export default api;

// Export des services
export * from './services/chat';
export * from './services/memory';
export * from './services/ml';
export * from './services/agent';
export * from './services/workflow'; 