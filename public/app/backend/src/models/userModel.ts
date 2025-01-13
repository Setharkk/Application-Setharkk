import { db } from '../config/db';
import bcrypt from 'bcrypt';
import { AppError } from '../errors/appError';

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserDocument {
    id: number;
    user_id: number;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserUpdateData {
    username?: string;
    email?: string;
}

export class UserModel {
    // Créer un nouvel utilisateur
    static async create(username: string, email: string, password: string): Promise<number> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query<{ insertId: number }>(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw new AppError('Erreur lors de la création de l\'utilisateur', 500);
        }
    }

    // Trouver un utilisateur par email
    static async findByEmail(email: string): Promise<User | null> {
        try {
            const users = await db.query<User[]>('SELECT * FROM users WHERE email = ?', [email]);
            return users[0] || null;
        } catch (error) {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error);
            throw new AppError('Erreur lors de la recherche de l\'utilisateur', 500);
        }
    }

    // Vérifier les identifiants
    static async authenticate(email: string, password: string): Promise<User | null> {
        try {
            const user = await this.findByEmail(email);
            if (!user) return null;

            const isValid = await bcrypt.compare(password, user.password_hash);
            return isValid ? user : null;
        } catch (error) {
            console.error('Erreur lors de l\'authentification:', error);
            throw new AppError('Erreur lors de l\'authentification', 500);
        }
    }

    // Mettre à jour un utilisateur
    static async update(id: number, updateData: UserUpdateData): Promise<boolean> {
        try {
            const { username, email } = updateData;
            const result = await db.query<{ affectedRows: number }>(
                'UPDATE users SET username = ?, email = ? WHERE id = ?',
                [username, email, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw new AppError('Erreur lors de la mise à jour de l\'utilisateur', 500);
        }
    }

    // Supprimer un utilisateur
    static async delete(id: number): Promise<boolean> {
        try {
            const result = await db.query<{ affectedRows: number }>(
                'DELETE FROM users WHERE id = ?', 
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            throw new AppError('Erreur lors de la suppression de l\'utilisateur', 500);
        }
    }

    // Obtenir tous les documents d'un utilisateur
    static async getUserDocuments(userId: number): Promise<UserDocument[]> {
        try {
            return await db.query<UserDocument[]>(
                'SELECT * FROM editor_documents WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
        } catch (error) {
            console.error('Erreur lors de la récupération des documents:', error);
            throw new AppError('Erreur lors de la récupération des documents', 500);
        }
    }
} 