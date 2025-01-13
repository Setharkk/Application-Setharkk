import { Router } from 'express';
import { CRMController } from '../controllers/crm.controller';

const router = Router();
const crmController = new CRMController();

// Routes pour les contacts
router.post('/contacts', crmController.createContact);
router.get('/contacts', crmController.getContacts);
router.get('/contacts/:contactId', crmController.getContactDetails);
router.put('/contacts/:contactId', crmController.updateContact);
router.delete('/contacts/:contactId', crmController.deleteContact);

// Routes pour les interactions
router.post('/contacts/:contactId/interactions', crmController.addInteraction);
router.get('/contacts/:contactId/interactions', crmController.getInteractions);

export default router; 