import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

interface DatabaseRequest extends Request {
    db: Pool;
}

interface RegisterRequestBody {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    password_hash: string;
}

const router = Router();

// Route d'inscription
router.post('/register', async (req: DatabaseRequest, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body as RegisterRequestBody;

        // Vérification des champs requis
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        // Vérification si l'utilisateur existe déjà
        const existingUser = await req.db.query<User>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création de l'utilisateur
        const result = await req.db.query<User>(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
            [email, hashedPassword, firstName, lastName]
        );

        const user = result.rows[0];

        // Génération du token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || '',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
router.post('/login', async (req: DatabaseRequest, res: Response) => {
    try {
        const { email, password } = req.body as LoginRequestBody;

        // Vérification des champs requis
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        // Recherche de l'utilisateur
        const result = await req.db.query<User>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const user = result.rows[0];

        // Vérification du mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Génération du token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || '',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

export default router; 