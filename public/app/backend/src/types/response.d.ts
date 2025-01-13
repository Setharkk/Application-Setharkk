import { Response } from 'express';

export function successResponse(res: Response, data: any, message?: string): void;
export function errorResponse(res: Response, error: Error, message: string, status?: number): void; 