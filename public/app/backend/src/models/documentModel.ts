import { db } from '../config/db';
import { AppError } from '../errors/appError';

export interface Document {
    id: number;
    user_id: number;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    last_analyzed?: Date;
}

export interface SeoAnalysis {
    id: number;
    document_id: number;
    score: number;
    recommendations: string;
    analyzed_at: Date;
}

export interface Keyword {
    keyword: string;
    density: number;
    suggestions: string;
}

export class DocumentModel {
    // Créer un nouveau document
    static async create(userId: number, title: string, content: string): Promise<number> {
        try {
            const result = await db.query<{ insertId: number }>(
                'INSERT INTO editor_documents (user_id, title, content) VALUES (?, ?, ?)',
                [userId, title, content]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur lors de la création du document:', error);
            throw new AppError('Erreur lors de la création du document', 500);
        }
    }

    // Obtenir un document par ID
    static async getById(documentId: number): Promise<Document | null> {
        try {
            const documents = await db.query<Document[]>(
                'SELECT * FROM editor_documents WHERE id = ?',
                [documentId]
            );
            return documents[0] || null;
        } catch (error) {
            console.error('Erreur lors de la récupération du document:', error);
            throw new AppError('Erreur lors de la récupération du document', 500);
        }
    }

    // Mettre à jour un document
    static async update(documentId: number, title: string, content: string): Promise<boolean> {
        try {
            const result = await db.query<{ affectedRows: number }>(
                'UPDATE editor_documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [title, content, documentId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du document:', error);
            throw new AppError('Erreur lors de la mise à jour du document', 500);
        }
    }

    // Supprimer un document
    static async delete(documentId: number): Promise<boolean> {
        try {
            const result = await db.query<{ affectedRows: number }>(
                'DELETE FROM editor_documents WHERE id = ?',
                [documentId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            throw new AppError('Erreur lors de la suppression du document', 500);
        }
    }

    // Sauvegarder une analyse SEO
    static async saveSeoAnalysis(
        documentId: number, 
        score: number, 
        recommendations: string
    ): Promise<number> {
        try {
            const result = await db.query<{ insertId: number }>(
                'INSERT INTO seo_analyses (document_id, score, recommendations) VALUES (?, ?, ?)',
                [documentId, score, recommendations]
            );
            await db.query(
                'UPDATE editor_documents SET last_analyzed = CURRENT_TIMESTAMP WHERE id = ?',
                [documentId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'analyse SEO:', error);
            throw new AppError('Erreur lors de la sauvegarde de l\'analyse SEO', 500);
        }
    }

    // Obtenir l'analyse SEO d'un document
    static async getSeoAnalysis(documentId: number): Promise<SeoAnalysis | null> {
        try {
            const analyses = await db.query<SeoAnalysis[]>(
                'SELECT * FROM seo_analyses WHERE document_id = ? ORDER BY analyzed_at DESC LIMIT 1',
                [documentId]
            );
            return analyses[0] || null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'analyse SEO:', error);
            throw new AppError('Erreur lors de la récupération de l\'analyse SEO', 500);
        }
    }

    // Sauvegarder des mots-clés SEO
    static async saveKeywords(documentId: number, keywords: Keyword[]): Promise<boolean> {
        try {
            const values = keywords.map(k => [documentId, k.keyword, k.density, k.suggestions]);
            await db.query(
                'INSERT INTO seo_keywords (document_id, keyword, density, suggestions) VALUES ?',
                [values]
            );
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des mots-clés:', error);
            throw new AppError('Erreur lors de la sauvegarde des mots-clés', 500);
        }
    }
} 