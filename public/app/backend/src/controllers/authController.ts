import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { successResponse, errorResponse } from '../utils/response';
import { security } from '../config/api';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
    };
}

interface LoginCredentials {
    username: string;
    password: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password }: LoginCredentials = req.body;

        // Dans un environnement de production, utilisez une vraie base de données
        // et un hachage de mot de passe avec bcrypt
        if (username === "admin" && password === "password") {
            const token = jwt.sign(
                { id: 1, username },
                security.jwt.secret,
                { expiresIn: security.jwt.expiresIn }
            );

            logger.info('Connexion réussie', { username });
            successResponse(res, { token });
        } else {
            logger.warn('Tentative de connexion échouée', { username });
            errorResponse(res, new Error('Identifiants invalides'), 'Identifiants invalides', 401);
        }
    } catch (error) {
        logger.error('Erreur lors de la connexion:', error);
        errorResponse(res, error instanceof Error ? error : new Error('Erreur inconnue'), 'Erreur lors de la connexion');
    }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Dans un environnement de production, vous pourriez vouloir
        // blacklister le token ou gérer une liste de tokens invalides
        if (req.user) {
            logger.info('Déconnexion réussie', { userId: req.user.id });
            successResponse(res, null, 'Déconnexion réussie');
        } else {
            throw new Error('Utilisateur non authentifié');
        }
    } catch (error) {
        logger.error('Erreur lors de la déconnexion:', error);
        errorResponse(res, error instanceof Error ? error : new Error('Erreur inconnue'), 'Erreur lors de la déconnexion');
    }
}; 