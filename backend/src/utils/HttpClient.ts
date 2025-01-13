import axios from 'axios';

export class HttpClient {
    private readonly baseURL: string;
    private readonly headers: Record<string, string>;

    constructor(baseURL: string, config?: { headers?: Record<string, string> }) {
        this.baseURL = baseURL;
        this.headers = config?.headers || {};
    }

    async get<T>(url: string, config?: { headers?: Record<string, string> }): Promise<T> {
        const response = await axios.get<T>(`${this.baseURL}${url}`, {
            headers: { ...this.headers, ...config?.headers }
        });
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: { headers?: Record<string, string> }): Promise<T> {
        const response = await axios.post<T>(`${this.baseURL}${url}`, data, {
            headers: { ...this.headers, ...config?.headers }
        });
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: { headers?: Record<string, string> }): Promise<T> {
        const response = await axios.put<T>(`${this.baseURL}${url}`, data, {
            headers: { ...this.headers, ...config?.headers }
        });
        return response.data;
    }

    async delete<T>(url: string, config?: { headers?: Record<string, string> }): Promise<T> {
        const response = await axios.delete<T>(`${this.baseURL}${url}`, {
            headers: { ...this.headers, ...config?.headers }
        });
        return response.data;
    }
} 