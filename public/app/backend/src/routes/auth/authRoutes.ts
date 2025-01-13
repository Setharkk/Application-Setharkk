import { Router } from 'express';
import { validate } from '../../middleware/validation';
import { body } from 'express-validator';
import { AppError } from '../../errors/appError';
import { authService } from '../../services/authService';
import { metricsService } from '../../services/metricsService';

const router = Router();

// Validation du login
const loginValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court')
];

// Validation de l'inscription
const registerValidation = [
    ...loginValidation,
    body('name').notEmpty().withMessage('Nom requis'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Rôle invalide')
];

// Login
router.post('/login', validate(loginValidation), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await metricsService.measureOperation(
            'auth',
            'login',
            async () => await authService.login(email, password)
        );
        res.json(result);
    } catch (error) {
        next(new AppError('Erreur lors de la connexion', 401));
    }
});

// Inscription
router.post('/register', validate(registerValidation), async (req, res, next) => {
    try {
        const result = await metricsService.measureOperation(
            'auth',
            'register',
            async () => await authService.register(req.body)
        );
        res.status(201).json(result);
    } catch (error) {
        next(new AppError('Erreur lors de l\'inscription', 400));
    }
});

// Vérification du token
router.get('/verify', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new AppError('Token manquant', 401);
        }

        const result = await metricsService.measureOperation(
            'auth',
            'verify',
            async () => await authService.verifyToken(token)
        );
        res.json(result);
    } catch (error) {
        next(new AppError('Token invalide', 401));
    }
});

// Déconnexion
router.post('/logout', async (req, res) => {
    await metricsService.measureOperation(
        'auth',
        'logout',
        async () => await authService.logout(req.user.id)
    );
    res.json({ message: 'Déconnexion réussie' });
});

export default router; 