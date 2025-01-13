import { Response } from 'express';

export function successResponse(res: Response, data: any, message?: string): void {
    res.json({
        success: true,
        message,
        data
    });
}

export function errorResponse(res: Response, error: Error, message: string, status: number = 500): void {
    res.status(status).json({
        success: false,
        message,
        error: error.message
    });
} 