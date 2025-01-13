import { Request, Response } from 'express';
import { crmService } from '../services';
import logger from '../services/logger';

export class CRMController {
    async createContact(req: Request, res: Response) {
        try {
            const contactData = req.body;
            const contact = await crmService.createContact(contactData);
            res.json(contact);
        } catch (error) {
            logger.error('Erreur lors de la création du contact:', error);
            res.status(500).json({ error: 'Erreur lors de la création du contact' });
        }
    }

    async getContacts(req: Request, res: Response) {
        try {
            const { status, tags, search } = req.query;
            const contacts = await crmService.getContacts({
                status: status as string,
                tags: tags ? (tags as string).split(',') : undefined,
                search: search as string
            });
            res.json(contacts);
        } catch (error) {
            logger.error('Erreur lors de la récupération des contacts:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des contacts' });
        }
    }

    async getContactDetails(req: Request, res: Response) {
        try {
            const { contactId } = req.params;
            const contact = await crmService.getContactDetails(contactId);
            res.json(contact);
        } catch (error) {
            logger.error('Erreur lors de la récupération des détails du contact:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des détails du contact' });
        }
    }

    async updateContact(req: Request, res: Response) {
        try {
            const { contactId } = req.params;
            const updateData = req.body;
            const updated = await crmService.updateContact(contactId, updateData);
            res.json(updated);
        } catch (error) {
            logger.error('Erreur lors de la mise à jour du contact:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du contact' });
        }
    }

    async deleteContact(req: Request, res: Response) {
        try {
            const { contactId } = req.params;
            await crmService.deleteContact(contactId);
            res.json({ message: 'Contact supprimé avec succès' });
        } catch (error) {
            logger.error('Erreur lors de la suppression du contact:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du contact' });
        }
    }

    async addInteraction(req: Request, res: Response) {
        try {
            const { contactId } = req.params;
            const interactionData = req.body;
            const interaction = await crmService.addInteraction(contactId, interactionData);
            res.json(interaction);
        } catch (error) {
            logger.error('Erreur lors de l\'ajout de l\'interaction:', error);
            res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'interaction' });
        }
    }

    async getInteractions(req: Request, res: Response) {
        try {
            const { contactId } = req.params;
            const interactions = await crmService.getInteractions(contactId);
            res.json(interactions);
        } catch (error) {
            logger.error('Erreur lors de la récupération des interactions:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des interactions' });
        }
    }
} 