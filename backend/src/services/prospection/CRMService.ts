import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';
import { RabbitMQ, RabbitMessage } from '../../utils/RabbitMQ';

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    source: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Interaction {
    id: string;
    contactId: string;
    type: string;
    summary: string;
    channel: string;
    date: Date;
}

export interface Opportunity {
    id: string;
    contactId: string;
    title: string;
    value: number;
    status: string;
    probability: number;
    expected_close_date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CRMServiceConfig {
    elasticsearch: ElasticsearchConfig;
    rabbitmq: {
        url: string;
    };
}

export class CRMService {
    private readonly elasticsearch: ElasticsearchService;
    private readonly rabbitmq: RabbitMQ;
    private readonly INDEX_PREFIX = 'crm';
    private readonly QUEUE_PREFIX = 'crm';

    constructor(config: CRMServiceConfig) {
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            await this.createIndices();
            await this.setupQueues();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service CRM:', error);
            throw error;
        }
    }

    private async createIndices(): Promise<void> {
        try {
            // Index des contacts
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_contacts`, {
                properties: {
                    id: { type: 'keyword' },
                    firstName: { type: 'text' },
                    lastName: { type: 'text' },
                    email: { type: 'keyword' },
                    phone: { type: 'keyword' },
                    company: { type: 'text' },
                    position: { type: 'text' },
                    source: { type: 'keyword' },
                    status: { type: 'keyword' },
                    tags: { type: 'keyword' },
                    notes: { type: 'text' },
                    lastContact: { type: 'date' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des interactions
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_interactions`, {
                properties: {
                    id: { type: 'keyword' },
                    contactId: { type: 'keyword' },
                    type: { type: 'keyword' },
                    summary: { type: 'text' },
                    channel: { type: 'keyword' },
                    outcome: { type: 'text' },
                    next_steps: { type: 'text' },
                    date: { type: 'date' }
                }
            });

            // Index des opportunités
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_opportunities`, {
                properties: {
                    id: { type: 'keyword' },
                    contactId: { type: 'keyword' },
                    title: { type: 'text' },
                    value: { type: 'float' },
                    status: { type: 'keyword' },
                    probability: { type: 'integer' },
                    expected_close_date: { type: 'date' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la création des indices:', error);
            throw error;
        }
    }

    private async setupQueues(): Promise<void> {
        try {
            await this.rabbitmq.createQueue(`${this.QUEUE_PREFIX}_events`);
            await this.rabbitmq.createQueue(`${this.QUEUE_PREFIX}_tasks`);
        } catch (error) {
            console.error('Erreur lors de la configuration des files d\'attente:', error);
            throw error;
        }
    }

    async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
        try {
            const newContact: Contact = {
                ...contact,
                id: this.generateId(),
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                company: contact.company,
                source: contact.source,
                status: contact.status,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_contacts`,
                newContact.id,
                newContact as unknown as Record<string, unknown>
            );

            return newContact;
        } catch (error) {
            console.error('Erreur lors de la création du contact:', error);
            throw error;
        }
    }

    async updateContact(id: string, update: Partial<Contact>): Promise<Contact | null> {
        try {
            const contact = await this.getContact(id);
            if (!contact) {
                return null;
            }

            const updatedContact: Contact = {
                ...contact,
                ...update,
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_contacts`,
                id,
                updatedContact as unknown as Record<string, unknown>
            );

            return updatedContact;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contact:', error);
            throw error;
        }
    }

    async addInteraction(contactId: string, interaction: Omit<Interaction, 'id' | 'contactId'>): Promise<void> {
        try {
            const newInteraction: Interaction = {
                ...interaction,
                id: this.generateId(),
                contactId
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_interactions`,
                newInteraction.id,
                newInteraction as unknown as Record<string, unknown>
            );

            const message: RabbitMessage = {
                type: 'interaction_added',
                data: newInteraction as unknown as Record<string, unknown>,
                timestamp: new Date()
            };

            await this.rabbitmq.publish(`${this.QUEUE_PREFIX}_events`, message);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'interaction:', error);
            throw error;
        }
    }

    async addOpportunity(contactId: string, opportunity: Omit<Opportunity, 'id' | 'contactId' | 'createdAt' | 'updatedAt'>): Promise<void> {
        try {
            const newOpportunity: Opportunity = {
                ...opportunity,
                id: this.generateId(),
                contactId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_opportunities`,
                newOpportunity.id,
                newOpportunity as unknown as Record<string, unknown>
            );

            const message: RabbitMessage = {
                type: 'opportunity_added',
                data: newOpportunity as unknown as Record<string, unknown>,
                timestamp: new Date()
            };

            await this.rabbitmq.publish(`${this.QUEUE_PREFIX}_events`, message);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'opportunité:', error);
            throw error;
        }
    }

    async getContact(id: string): Promise<Contact | null> {
        try {
            return await this.elasticsearch.get<Contact>(
                `${this.INDEX_PREFIX}_contacts`,
                id
            );
        } catch (error) {
            console.error('Erreur lors de la récupération du contact:', error);
            return null;
        }
    }

    async searchContacts(query: Record<string, unknown>): Promise<Contact[]> {
        try {
            const response = await this.elasticsearch.search<Contact>(
                `${this.INDEX_PREFIX}_contacts`,
                query
            );

            return response;
        } catch (error) {
            console.error('Erreur lors de la recherche des contacts:', error);
            throw error;
        }
    }

    async getContactInteractions(contactId: string): Promise<Interaction[]> {
        try {
            const query = {
                term: {
                    contactId: contactId
                }
            };

            const response = await this.elasticsearch.search<Interaction>(
                `${this.INDEX_PREFIX}_interactions`,
                query
            );

            return response;
        } catch (error) {
            console.error('Erreur lors de la récupération des interactions:', error);
            throw error;
        }
    }

    async getContactOpportunities(contactId: string): Promise<Opportunity[]> {
        try {
            const query = {
                term: {
                    contactId: contactId
                }
            };

            const response = await this.elasticsearch.search<Opportunity>(
                `${this.INDEX_PREFIX}_opportunities`,
                query
            );

            return response;
        } catch (error) {
            console.error('Erreur lors de la récupération des opportunités:', error);
            throw error;
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    async cleanup(): Promise<void> {
        try {
            await this.rabbitmq.close();
        } catch (error) {
            console.error('Erreur lors du nettoyage du service CRM:', error);
            throw error;
        }
    }

    async createInteraction(interaction: Omit<Interaction, 'id'>): Promise<Interaction> {
        try {
            const newInteraction: Interaction = {
                ...interaction,
                id: this.generateId(),
                contactId: interaction.contactId,
                type: interaction.type,
                summary: interaction.summary,
                channel: interaction.channel,
                date: interaction.date
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_interactions`,
                newInteraction.id,
                newInteraction as unknown as Record<string, unknown>
            );

            const message: RabbitMessage = {
                type: 'interaction_created',
                data: newInteraction as unknown as Record<string, unknown>,
                timestamp: new Date()
            };

            await this.rabbitmq.publish(
                `${this.QUEUE_PREFIX}_events`,
                message
            );

            return newInteraction;
        } catch (error) {
            console.error('Erreur lors de la création de l\'interaction:', error);
            throw error;
        }
    }
} 