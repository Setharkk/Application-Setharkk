import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';

interface ProspectMetadata {
    industry?: string;
    revenue?: number;
    employees?: number;
    location?: string;
    website?: string;
    socialMedia?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
    };
    customFields?: Record<string, string | number | boolean>;
}

interface ActivityDetails {
    emailSubject?: string;
    emailContent?: string;
    callDuration?: number;
    meetingDuration?: number;
    meetingLocation?: string;
    statusChange?: {
        oldStatus: Prospect['status'];
        newStatus: Prospect['status'];
    };
    noteContent?: string;
}

interface Prospect {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    source: string;
    status: 'new' | 'qualified' | 'contacted' | 'converted' | 'rejected';
    score?: number;
    lastContact?: Date;
    nextContact?: Date;
    notes?: string[];
    tags?: string[];
    metadata?: ProspectMetadata;
    createdAt: Date;
    updatedAt: Date;
}

interface ProspectActivity {
    id: string;
    prospectId: string;
    type: 'email' | 'call' | 'meeting' | 'note' | 'status_change';
    timestamp: Date;
    details: ActivityDetails;
    outcome?: 'positive' | 'negative' | 'neutral';
    notes?: string;
}

interface ProspectFilter {
    status?: Prospect['status'];
    source?: string;
    minScore?: number;
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
}

interface ProspectionStats {
    total: number;
    byStatus: Record<Prospect['status'], number>;
    bySource: Record<string, number>;
    conversionRate: number;
    averageQualificationTime: number;
}

export class ProspectionService extends BaseService {
    private readonly prospects: Map<string, Prospect>;
    private readonly activities: Map<string, ProspectActivity[]>;

    constructor() {
        super(
            {
                id: 'prospection-service',
                name: 'Prospection Service',
                type: ServiceType.BUSINESS,
                dependencies: ['database', 'cache']
            },
            {
                version: '1.0.0',
                description: 'Handles prospect management and tracking',
                author: 'Team Business',
                tags: ['prospects', 'sales', 'crm']
            }
        );
        
        this.prospects = new Map();
        this.activities = new Map();
    }

    protected async doInitialize(): Promise<void> {
        logger.info('Service de prospection initialisé');
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Service de prospection arrêté');
        this.prospects.clear();
        this.activities.clear();
    }

    async createProspect(data: Omit<Prospect, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Prospect> {
        try {
            const id = this.generateProspectId();
            const now = new Date();

            const prospect: Prospect = {
                ...data,
                id,
                status: 'new',
                createdAt: now,
                updatedAt: now
            };

            this.prospects.set(id, prospect);
            this.activities.set(id, []);

            logger.info(`Nouveau prospect créé: ${id}`);
            return prospect;
        } catch (error) {
            logger.error('Erreur lors de la création du prospect:', error);
            throw error;
        }
    }

    async getProspect(id: string): Promise<Prospect | null> {
        return this.prospects.get(id) || null;
    }

    async listProspects(filter?: ProspectFilter): Promise<Prospect[]> {
        try {
            let prospects = Array.from(this.prospects.values());

            if (filter) {
                prospects = prospects.filter(prospect => {
                    if (filter.status && prospect.status !== filter.status) return false;
                    if (filter.source && prospect.source !== filter.source) return false;
                    if (filter.minScore && (prospect.score || 0) < filter.minScore) return false;
                    if (filter.tags && filter.tags.length > 0) {
                        return filter.tags.some(tag => prospect.tags?.includes(tag));
                    }
                    if (filter.startDate && prospect.createdAt < filter.startDate) return false;
                    if (filter.endDate && prospect.createdAt > filter.endDate) return false;
                    return true;
                });
            }

            return prospects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        } catch (error) {
            logger.error('Erreur lors de la récupération des prospects:', error);
            throw error;
        }
    }

    async updateProspect(id: string, updates: Partial<Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Prospect> {
        try {
            const prospect = this.prospects.get(id);
            if (!prospect) {
                throw new Error(`Prospect non trouvé: ${id}`);
            }

            const updatedProspect = {
                ...prospect,
                ...updates,
                updatedAt: new Date()
            };

            this.prospects.set(id, updatedProspect);

            if (updates.status && updates.status !== prospect.status) {
                await this.addActivity({
                    prospectId: id,
                    type: 'status_change',
                    details: {
                        statusChange: {
                            oldStatus: prospect.status,
                            newStatus: updates.status
                        }
                    }
                });
            }

            logger.info(`Prospect mis à jour: ${id}`);
            return updatedProspect;
        } catch (error) {
            logger.error(`Erreur lors de la mise à jour du prospect ${id}:`, error);
            throw error;
        }
    }

    async deleteProspect(id: string): Promise<void> {
        try {
            this.prospects.delete(id);
            this.activities.delete(id);
            logger.info(`Prospect supprimé: ${id}`);
        } catch (error) {
            logger.error(`Erreur lors de la suppression du prospect ${id}:`, error);
            throw error;
        }
    }

    async addActivity(data: Omit<ProspectActivity, 'id' | 'timestamp'>): Promise<ProspectActivity> {
        try {
            const id = this.generateActivityId();
            const activity: ProspectActivity = {
                ...data,
                id,
                timestamp: new Date()
            };

            const activities = this.activities.get(data.prospectId) || [];
            activities.push(activity);
            this.activities.set(data.prospectId, activities);

            const prospect = this.prospects.get(data.prospectId);
            if (prospect) {
                prospect.updatedAt = activity.timestamp;
                if (data.type === 'status_change' && data.details.statusChange) {
                    prospect.status = data.details.statusChange.newStatus;
                }
                this.prospects.set(data.prospectId, prospect);
            }

            logger.info(`Nouvelle activité ajoutée pour le prospect ${data.prospectId}: ${id}`);
            return activity;
        } catch (error) {
            logger.error('Erreur lors de l\'ajout de l\'activité:', error);
            throw error;
        }
    }

    async getActivities(prospectId: string): Promise<ProspectActivity[]> {
        return this.activities.get(prospectId) || [];
    }

    async getStats(timeRange?: { start: Date; end: Date }): Promise<ProspectionStats> {
        try {
            let prospects = Array.from(this.prospects.values());
            
            if (timeRange) {
                prospects = prospects.filter(p => 
                    p.createdAt >= timeRange.start && 
                    p.createdAt <= timeRange.end
                );
            }

            const statusCount: Record<Prospect['status'], number> = {
                new: 0,
                qualified: 0,
                contacted: 0,
                converted: 0,
                rejected: 0
            };

            const sourceCount: Record<string, number> = {};
            let convertedCount = 0;
            let totalQualificationTime = 0;
            let qualifiedCount = 0;

            prospects.forEach(prospect => {
                statusCount[prospect.status]++;
                sourceCount[prospect.source] = (sourceCount[prospect.source] || 0) + 1;

                if (prospect.status === 'converted') {
                    convertedCount++;
                }

                const activities = this.activities.get(prospect.id) || [];
                const qualificationActivity = activities.find(a => 
                    a.type === 'status_change' && 
                    a.details.statusChange?.newStatus === 'qualified'
                );

                if (qualificationActivity) {
                    qualifiedCount++;
                    totalQualificationTime += qualificationActivity.timestamp.getTime() - prospect.createdAt.getTime();
                }
            });

            return {
                total: prospects.length,
                byStatus: statusCount,
                bySource: sourceCount,
                conversionRate: prospects.length > 0 ? (convertedCount / prospects.length) * 100 : 0,
                averageQualificationTime: qualifiedCount > 0 ? totalQualificationTime / qualifiedCount : 0
            };
        } catch (error) {
            logger.error('Erreur lors du calcul des statistiques:', error);
            throw error;
        }
    }

    private generateProspectId(): string {
        return `prospect_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    private generateActivityId(): string {
        return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
}

export const prospectionService = new ProspectionService(); 