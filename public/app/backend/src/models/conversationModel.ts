import { db } from '../config/db';
import { AppError } from '../errors/appError';

export interface Message {
    id: number;
    conversation_id: number;
    content: string;
    role: 'user' | 'assistant' | 'system';
    created_at: Date;
    updated_at: Date;
}

export interface Conversation {
    id: number;
    user_id: number;
    title: string;
    created_at: Date;
    updated_at: Date;
}

export interface ConversationWithMessages extends Conversation {
    messages: Message[];
}

export class ConversationModel {
    // Créer une nouvelle conversation
    static async create(userId: number, title: string): Promise<number> {
        try {
            const result = await db.query<{ insertId: number }>(
                'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
                [userId, title]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur lors de la création de la conversation:', error);
            throw new AppError('Erreur lors de la création de la conversation', 500);
        }
    }

    // Ajouter un message à une conversation
    static async addMessage(
        conversationId: number, 
        content: string, 
        role: Message['role']
    ): Promise<number> {
        try {
            const result = await db.query<{ insertId: number }>(
                'INSERT INTO messages (conversation_id, content, role) VALUES (?, ?, ?)',
                [conversationId, content, role]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du message:', error);
            throw new AppError('Erreur lors de l\'ajout du message', 500);
        }
    }

    // Obtenir une conversation avec ses messages
    static async getWithMessages(conversationId: number): Promise<ConversationWithMessages | null> {
        try {
            const conversations = await db.query<Conversation[]>(
                'SELECT * FROM conversations WHERE id = ?',
                [conversationId]
            );

            if (!conversations[0]) return null;

            const messages = await db.query<Message[]>(
                'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
                [conversationId]
            );

            return {
                ...conversations[0],
                messages
            };
        } catch (error) {
            console.error('Erreur lors de la récupération de la conversation:', error);
            throw new AppError('Erreur lors de la récupération de la conversation', 500);
        }
    }

    // Obtenir toutes les conversations d'un utilisateur
    static async getAllForUser(userId: number): Promise<Conversation[]> {
        try {
            return await db.query<Conversation[]>(
                'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
                [userId]
            );
        } catch (error) {
            console.error('Erreur lors de la récupération des conversations:', error);
            throw new AppError('Erreur lors de la récupération des conversations', 500);
        }
    }

    // Supprimer une conversation et ses messages
    static async delete(conversationId: number): Promise<boolean> {
        try {
            const result = await db.query<{ affectedRows: number }>(
                'DELETE FROM conversations WHERE id = ?',
                [conversationId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la suppression de la conversation:', error);
            throw new AppError('Erreur lors de la suppression de la conversation', 500);
        }
    }

    // Mettre à jour le titre d'une conversation
    static async updateTitle(conversationId: number, newTitle: string): Promise<boolean> {
        try {
            const result = await db.query<{ affectedRows: number }>(
                'UPDATE conversations SET title = ? WHERE id = ?',
                [newTitle, conversationId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du titre:', error);
            throw new AppError('Erreur lors de la mise à jour du titre', 500);
        }
    }
} 