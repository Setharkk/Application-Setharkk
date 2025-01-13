import { db } from '../config/database';
import { Logger } from '../utils/logger';
import { AppError } from '../errors/appError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    email: string;
    password?: string;
    name: string;
    role: 'user' | 'admin';
    created_at: Date;
    updated_at: Date;
}

interface UserRegistrationData {
    email: string;
    password: string;
    name: string;
    role?: 'user' | 'admin';
}

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthResponse {
    user: Omit<User, 'password'>;
    tokens: Tokens;
}

interface RefreshToken {
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
}

interface PasswordResetToken {
    user_id: string;
    token: string;
    expires_at: Date;
    created_at: Date;
}

export class AuthService {
    private readonly SALT_ROUNDS = 10;
    private readonly TOKEN_EXPIRY = '24h';
    private readonly REFRESH_TOKEN_EXPIRY = '7d';
    private logger: Logger;

    constructor() {
        this.logger = new Logger('AuthService');
    }

    async register(userData: UserRegistrationData): Promise<AuthResponse> {
        try {
            const existingUser = await db<User>('users')
                .where('email', userData.email)
                .first();

            if (existingUser) {
                throw new AppError('L\'utilisateur existe déjà', 400);
            }

            const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

            const [userId] = await db<User>('users').insert({
                id: uuidv4(),
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
                role: userData.role || 'user',
                created_at: new Date(),
                updated_at: new Date()
            });

            const user = await this.getUserById(userId);
            if (!user) {
                throw new AppError('Erreur lors de la création de l\'utilisateur', 500);
            }

            const { password, ...userWithoutPassword } = user;
            const tokens = await this.generateTokens(user);

            return {
                user: userWithoutPassword,
                tokens
            };
        } catch (error) {
            this.logger.error('Erreur lors de l\'inscription:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec de l\'inscription', 500);
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await db<User>('users')
                .where('email', email)
                .first();

            if (!user) {
                throw new AppError('Identifiants invalides', 401);
            }

            const isValid = await bcrypt.compare(password, user.password!);
            if (!isValid) {
                throw new AppError('Identifiants invalides', 401);
            }

            const { password: _, ...userWithoutPassword } = user;
            const tokens = await this.generateTokens(user);

            return {
                user: userWithoutPassword,
                tokens
            };
        } catch (error) {
            this.logger.error('Erreur lors de la connexion:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec de la connexion', 500);
        }
    }

    async refreshToken(refreshToken: string): Promise<Tokens> {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as jwt.JwtPayload;
            
            const storedToken = await db<RefreshToken>('refresh_tokens')
                .where('token', refreshToken)
                .first();

            if (!storedToken) {
                throw new AppError('Token de rafraîchissement invalide', 401);
            }

            const user = await this.getUserById(decoded.userId);
            if (!user) {
                throw new AppError('Utilisateur non trouvé', 404);
            }

            const tokens = await this.generateTokens(user);

            await db('refresh_tokens')
                .where('token', refreshToken)
                .delete();

            return tokens;
        } catch (error) {
            this.logger.error('Erreur lors du rafraîchissement du token:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec du rafraîchissement du token', 500);
        }
    }

    async logout(refreshToken: string): Promise<boolean> {
        try {
            await db('refresh_tokens')
                .where('token', refreshToken)
                .delete();

            return true;
        } catch (error) {
            this.logger.error('Erreur lors de la déconnexion:', error as Error);
            throw new AppError('Échec de la déconnexion', 500);
        }
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            const user = await db<User>('users')
                .where('id', userId)
                .first();

            if (!user) {
                throw new AppError('Utilisateur non trouvé', 404);
            }

            const isValid = await bcrypt.compare(oldPassword, user.password!);
            if (!isValid) {
                throw new AppError('Ancien mot de passe invalide', 400);
            }

            const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            await db('users')
                .where('id', userId)
                .update({
                    password: hashedPassword,
                    updated_at: new Date()
                });

            return true;
        } catch (error) {
            this.logger.error('Erreur lors du changement de mot de passe:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec du changement de mot de passe', 500);
        }
    }

    async resetPasswordRequest(email: string): Promise<boolean> {
        try {
            const user = await db<User>('users')
                .where('email', email)
                .first();

            if (!user) {
                return true; // Pour des raisons de sécurité, ne pas indiquer si l'email existe
            }

            const token = uuidv4();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);

            await db<PasswordResetToken>('password_reset_tokens').insert({
                user_id: user.id,
                token,
                expires_at: expiresAt,
                created_at: new Date()
            });

            // TODO: Envoyer l'email avec le token
            // await emailService.sendPasswordReset(email, token);

            return true;
        } catch (error) {
            this.logger.error('Erreur lors de la demande de réinitialisation:', error as Error);
            throw new AppError('Échec de la demande de réinitialisation', 500);
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        try {
            const resetToken = await db<PasswordResetToken>('password_reset_tokens')
                .where('token', token)
                .where('expires_at', '>', new Date())
                .first();

            if (!resetToken) {
                throw new AppError('Token invalide ou expiré', 400);
            }

            const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            await db.transaction(async trx => {
                await trx('users')
                    .where('id', resetToken.user_id)
                    .update({
                        password: hashedPassword,
                        updated_at: new Date()
                    });

                await trx('password_reset_tokens')
                    .where('token', token)
                    .delete();
            });

            return true;
        } catch (error) {
            this.logger.error('Erreur lors de la réinitialisation du mot de passe:', error as Error);
            throw error instanceof AppError ? error : new AppError('Échec de la réinitialisation du mot de passe', 500);
        }
    }

    private async generateTokens(user: User): Promise<Tokens> {
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: this.TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: this.REFRESH_TOKEN_EXPIRY }
        );

        await db<RefreshToken>('refresh_tokens').insert({
            user_id: user.id,
            token: refreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
            created_at: new Date()
        });

        return { accessToken, refreshToken };
    }

    private async getUserById(id: string): Promise<User | undefined> {
        return await db<User>('users')
            .where('id', id)
            .first();
    }
}

export const authService = new AuthService(); 