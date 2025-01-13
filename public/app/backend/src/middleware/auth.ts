import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface User {
            id: string;
            role: string;
        }
    }
}

// Accès direct sans token
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // On définit automatiquement l'utilisateur comme assistant
    req.user = {
        id: 'assistant',
        role: 'assistant'
    };
    next();
};

export const authorizeAssistant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Accès toujours autorisé
    next();
};

export default authenticate; 