import { RabbitMQ, RabbitMessage } from '../../utils/RabbitMQ';
import { ElasticsearchService, ElasticsearchConfig } from '../database/ElasticsearchService';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export interface EmailConfig {
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    from: string;
    elasticsearch: ElasticsearchConfig;
    rabbitmq: {
        url: string;
    };
}

export interface EmailTemplate extends Record<string, unknown> {
    id: string;
    name: string;
    subject: string;
    content: string;
    variables: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailCampaign extends Record<string, unknown> {
    id: string;
    name: string;
    templateId: string;
    recipients: string[];
    status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
    schedule?: Date;
    metrics: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        complained: number;
        unsubscribed: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailEvent {
    id: string;
    campaignId?: string;
    type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
    recipient: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export class EmailService {
    private readonly transporter: nodemailer.Transporter;
    private readonly elasticsearch: ElasticsearchService;
    private readonly rabbitmq: RabbitMQ;
    private readonly INDEX_PREFIX = 'email';
    private readonly QUEUE_PREFIX = 'email';
    private readonly from: string;

    constructor(config: EmailConfig) {
        this.transporter = nodemailer.createTransport(config.smtp);
        this.elasticsearch = new ElasticsearchService(config.elasticsearch);
        this.rabbitmq = new RabbitMQ(config.rabbitmq.url);
        this.from = config.from;
    }

    async initialize(): Promise<void> {
        try {
            await this.rabbitmq.connect();
            await this.createIndices();
            await this.setupQueues();
            await this.verifyConnection();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du service Email:', error);
            throw error;
        }
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
        } catch (error) {
            console.error('Erreur lors de la vérification de la connexion SMTP:', error);
            throw error;
        }
    }

    async sendEmail(to: string, subject: string, html: string, attachments?: Mail.Attachment[]): Promise<void> {
        try {
            const mailOptions: Mail.Options = {
                from: this.from,
                to,
                subject,
                html,
                attachments
            };

            await this.transporter.sendMail(mailOptions);
            await this.trackEmailEvent({
                id: this.generateId(),
                type: 'sent',
                recipient: to,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw error;
        }
    }

    async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
        try {
            const newTemplate: EmailTemplate = {
                id: this.generateId(),
                name: template.name as string,
                subject: template.subject as string,
                content: template.content as string,
                variables: template.variables as string[],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_templates`,
                newTemplate.id,
                newTemplate as unknown as Record<string, unknown>
            );

            return newTemplate;
        } catch (error) {
            console.error('Erreur lors de la création du template:', error);
            throw error;
        }
    }

    async getTemplate(id: string): Promise<EmailTemplate | null> {
        try {
            return await this.elasticsearch.get<EmailTemplate>(
                `${this.INDEX_PREFIX}_templates`,
                id
            );
        } catch (error) {
            console.error('Erreur lors de la récupération du template:', error);
            return null;
        }
    }

    async updateTemplate(id: string, update: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
        try {
            const template = await this.getTemplate(id);
            if (!template) {
                return null;
            }

            const updatedTemplate: EmailTemplate = {
                ...template,
                ...update,
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_templates`,
                id,
                updatedTemplate as unknown as Record<string, unknown>
            );

            return updatedTemplate;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du template:', error);
            throw error;
        }
    }

    async deleteTemplate(id: string): Promise<void> {
        try {
            await this.elasticsearch.delete(
                `${this.INDEX_PREFIX}_templates`,
                id
            );
        } catch (error) {
            console.error('Erreur lors de la suppression du template:', error);
            throw error;
        }
    }

    async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign> {
        try {
            const newCampaign: EmailCampaign = {
                id: this.generateId(),
                name: campaign.name as string,
                templateId: campaign.templateId as string,
                recipients: campaign.recipients as string[],
                status: campaign.status as 'draft' | 'scheduled' | 'running' | 'completed' | 'failed',
                metrics: {
                    sent: 0,
                    delivered: 0,
                    opened: 0,
                    clicked: 0,
                    bounced: 0,
                    complained: 0,
                    unsubscribed: 0
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_campaigns`,
                newCampaign.id,
                newCampaign as unknown as Record<string, unknown>
            );

            return newCampaign;
        } catch (error) {
            console.error('Erreur lors de la création de la campagne:', error);
            throw error;
        }
    }

    async getCampaign(id: string): Promise<EmailCampaign | null> {
        try {
            return await this.elasticsearch.get<EmailCampaign>(
                `${this.INDEX_PREFIX}_campaigns`,
                id
            );
        } catch (error) {
            console.error('Erreur lors de la récupération de la campagne:', error);
            return null;
        }
    }

    async updateCampaign(id: string, update: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
        try {
            const campaign = await this.getCampaign(id);
            if (!campaign) {
                return null;
            }

            const updatedCampaign: EmailCampaign = {
                ...campaign,
                ...update,
                updatedAt: new Date()
            };

            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_campaigns`,
                id,
                updatedCampaign as unknown as Record<string, unknown>
            );

            return updatedCampaign;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la campagne:', error);
            throw error;
        }
    }

    async deleteCampaign(id: string): Promise<void> {
        try {
            await this.elasticsearch.delete(
                `${this.INDEX_PREFIX}_campaigns`,
                id
            );
        } catch (error) {
            console.error('Erreur lors de la suppression de la campagne:', error);
            throw error;
        }
    }

    private async trackEmailEvent(event: EmailEvent): Promise<void> {
        try {
            await this.elasticsearch.index(
                `${this.INDEX_PREFIX}_events`,
                event.id,
                event as unknown as Record<string, unknown>
            );

            const message: RabbitMessage = {
                type: 'email_event',
                data: event as unknown as Record<string, unknown>,
                timestamp: new Date()
            };

            await this.rabbitmq.publish(
                `${this.QUEUE_PREFIX}_events`,
                message
            );
        } catch (error) {
            console.error('Erreur lors du suivi de l\'événement email:', error);
            throw error;
        }
    }

    private async createIndices(): Promise<void> {
        try {
            // Index des templates
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_templates`, {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    subject: { type: 'text' },
                    content: { type: 'text' },
                    variables: { type: 'keyword' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des campagnes
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_campaigns`, {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text' },
                    templateId: { type: 'keyword' },
                    recipients: { type: 'keyword' },
                    status: { type: 'keyword' },
                    schedule: { type: 'date' },
                    metrics: {
                        properties: {
                            sent: { type: 'integer' },
                            delivered: { type: 'integer' },
                            opened: { type: 'integer' },
                            clicked: { type: 'integer' },
                            bounced: { type: 'integer' },
                            complained: { type: 'integer' },
                            unsubscribed: { type: 'integer' }
                        }
                    },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            // Index des événements
            await this.elasticsearch.createIndex(`${this.INDEX_PREFIX}_events`, {
                properties: {
                    id: { type: 'keyword' },
                    campaignId: { type: 'keyword' },
                    type: { type: 'keyword' },
                    recipient: { type: 'keyword' },
                    timestamp: { type: 'date' },
                    metadata: { type: 'object' }
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

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    async cleanup(): Promise<void> {
        try {
            await this.rabbitmq.close();
            this.transporter.close();
        } catch (error) {
            console.error('Erreur lors du nettoyage du service Email:', error);
            throw error;
        }
    }
} 