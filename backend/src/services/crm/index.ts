import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';

interface ContactFilters {
  status?: string;
  tags?: string[];
  search?: string;
}

interface Interaction {
  id: string;
  contactId: string;
  type: string;
  date: string;
  description: string;
}

export class CRMService extends BaseService {
  private readonly contacts: Record<string, unknown>[] = [];
  private readonly interactions: Interaction[] = [];

  constructor() {
    super(
      {
        id: 'crm',
        name: 'CRM Service',
        type: ServiceType.BUSINESS,
        dependencies: ['database', 'analytics']
      },
      {
        version: '1.0.0',
        description: 'Service de gestion de la relation client',
        author: 'Setharkk',
        tags: ['crm', 'customers', 'analytics']
      }
    );
  }

  protected async doInitialize(): Promise<void> {
    // Initialisation du service
  }

  protected async doShutdown(): Promise<void> {
    // Arrêt du service
  }

  public async createContact(contactData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const contact = {
      ...contactData,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    this.contacts.push(contact);
    return contact;
  }

  public async getContacts(filters: ContactFilters = {}): Promise<Record<string, unknown>[]> {
    return this.contacts.filter(contact => {
      if (filters.status && contact.status !== filters.status) return false;
      if (filters.tags && !filters.tags.every(tag => (contact.tags as string[])?.includes(tag))) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return Object.values(contact).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }

  public async getContactDetails(contactId: string): Promise<Record<string, unknown> | null> {
    const contact = this.contacts.find(c => c.id === contactId);
    if (!contact) throw new Error('Contact non trouvé');
    return contact;
  }

  public async updateContact(contactId: string, updateData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const index = this.contacts.findIndex(c => c.id === contactId);
    if (index === -1) throw new Error('Contact non trouvé');
    
    this.contacts[index] = {
      ...this.contacts[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return this.contacts[index];
  }

  public async deleteContact(contactId: string): Promise<void> {
    const index = this.contacts.findIndex(c => c.id === contactId);
    if (index === -1) throw new Error('Contact non trouvé');
    this.contacts.splice(index, 1);
  }

  public async getInteractions(contactId: string): Promise<Interaction[]> {
    return this.interactions.filter(interaction => interaction.contactId === contactId);
  }

  public async addInteraction(contactId: string, interactionData: Omit<Interaction, 'id' | 'contactId' | 'date'>): Promise<Interaction> {
    const contact = await this.getContactDetails(contactId);
    if (!contact) throw new Error('Contact non trouvé');

    const interaction: Interaction = {
      ...interactionData,
      id: `interaction_${Date.now()}`,
      contactId,
      date: new Date().toISOString()
    };
    
    this.interactions.push(interaction);
    return interaction;
  }
}

export const crmService = new CRMService(); 