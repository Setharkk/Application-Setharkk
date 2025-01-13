import { Request, Response } from 'express';
import { learningService } from '../services';
import logger from '../services/logger';

export class LearningController {
    async createModel(req: Request, res: Response) {
        try {
            const modelData = req.body;
            const model = await learningService.createModel(modelData);
            res.json(model);
        } catch (error) {
            logger.error('Erreur lors de la création du modèle:', error);
            res.status(500).json({ error: 'Erreur lors de la création du modèle' });
        }
    }

    async getModels(req: Request, res: Response) {
        try {
            const { status, type } = req.query;
            const models = await learningService.getModels({
                status: status as 'failed' | 'created' | 'training' | 'trained',
                type: type as 'nlp' | 'classification' | 'regression' | 'clustering'
            });
            res.json(models);
        } catch (error) {
            logger.error('Erreur lors de la récupération des modèles:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des modèles' });
        }
    }

    async getModelDetails(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            const model = await learningService.getModelDetails(modelId);
            res.json(model);
        } catch (error) {
            logger.error('Erreur lors de la récupération des détails du modèle:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des détails du modèle' });
        }
    }

    async trainModel(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            const trainingData = req.body;
            const result = await learningService.trainModel(modelId, trainingData);
            res.json(result);
        } catch (error) {
            logger.error('Erreur lors de l\'entraînement du modèle:', error);
            res.status(500).json({ error: 'Erreur lors de l\'entraînement du modèle' });
        }
    }

    async evaluateModel(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            const testData = req.body;
            const evaluation = await learningService.evaluateModel(modelId, testData);
            res.json(evaluation);
        } catch (error) {
            logger.error('Erreur lors de l\'évaluation du modèle:', error);
            res.status(500).json({ error: 'Erreur lors de l\'évaluation du modèle' });
        }
    }

    async predictModel(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            const inputData = req.body;
            const prediction = await learningService.predict(modelId, inputData);
            res.json(prediction);
        } catch (error) {
            logger.error('Erreur lors de la prédiction:', error);
            res.status(500).json({ error: 'Erreur lors de la prédiction' });
        }
    }

    async updateModel(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            const updateData = req.body;
            const updated = await learningService.updateModel(modelId, updateData);
            res.json(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du modèle:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du modèle' });
        }
    }

    async deleteModel(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            await learningService.deleteModel(modelId);
            res.json({ message: 'Modèle supprimé avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la suppression du modèle:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du modèle' });
        }
    }

    async getModelMetrics(req: Request, res: Response) {
        try {
            const { modelId } = req.params;
            const metrics = await learningService.getModelMetrics(modelId);
            res.json(metrics);
        } catch (error) {
            logger.error('Erreur lors de la récupération des métriques:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des métriques' });
        }
    }
} 