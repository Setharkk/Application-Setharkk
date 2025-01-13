export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errors?: Record<string, string[]>;

    constructor(message: string, statusCode: number = 500, errors?: Record<string, string[]>) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        
        // Pour un bon stack trace
        Error.captureStackTrace(this, this.constructor);
    }
} 