import { Response } from 'express';
import logger from './logger';

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    timestamp: Date;
    data?: T;
    error?: string;
    stack?: string;
    errors?: ValidationError[];
}

interface ValidationError {
    field: string;
    message: string;
}

const successResponse = <T>(
    res: Response,
    data: T | null = null,
    message: string = 'Opération réussie',
    statusCode: number = 200
): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        timestamp: new Date()
    };

    if (data !== null) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};

const errorResponse = (
    res: Response,
    error: Error,
    message: string = 'Une erreur est survenue',
    statusCode: number = 500
): void => {
    logger.logErreur(error);

    const response: ApiResponse = {
        success: false,
        message,
        timestamp: new Date()
    };

    if (process.env.NODE_ENV === 'development') {
        response.error = error.message;
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
};

const validationErrorResponse = (
    res: Response,
    errors: ValidationError[]
): void => {
    const response: ApiResponse = {
        success: false,
        message: 'Erreur de validation',
        errors,
        timestamp: new Date()
    };

    res.status(400).json(response);
};

export {
    successResponse,
    errorResponse,
    validationErrorResponse,
    ApiResponse,
    ValidationError
}; 