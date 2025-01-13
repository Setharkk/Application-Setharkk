import { contextAnalysisService } from './contextAnalysisService';
import { enhancedLearningService } from './enhancedLearningService';
import { MarketingService } from './marketingService';
import { monitoringService } from './monitoringService';
import { MLService } from './mlService';
import { orchestratorService } from './orchestratorService';
import logger from './logger';

interface WorkflowAction {
    id: string;
    type: 'trigger' | 'condition' | 'action';
    name: string;
    config: Record<string, any>;
    nextActions: string[];
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    trigger: WorkflowAction;
    actions: WorkflowAction[];
    status: 'active' | 'draft' | 'paused';
    metadata: {
        created: Date;
        lastModified: Date;
        lastExecuted?: Date;
        successRate: number;
    };
}

interface AgentAction {
    type: 'analyze' | 'learn' | 'respond' | 'market' | 'monitor' | 'workflow';
    payload: Record<string, any>;
    priority: number;
    timestamp: Date;
}

interface AgentState {
    currentContext: Record<string, any>;
    activeActions: AgentAction[];
    activeWorkflows: Workflow[];
    performance: {
        successRate: number;
        responseTime: number;
        adaptationScore: number;
        workflowMetrics: {
            activeWorkflows: number;
            completionRate: number;
            averageExecutionTime: number;
        };
    };
}

class IntelligentAgentService {
    private mlService: MLService;
    private marketingService: MarketingService;
    private state: AgentState;
    private actionQueue: AgentAction[];
    private workflows: Map<string, Workflow>;

    constructor() {
        this.mlService = new MLService();
        this.marketingService = new MarketingService();
        this.actionQueue = [];
        this.workflows = new Map();
        this.state = {
            currentContext: {},
            activeActions: [],
            activeWorkflows: [],
            performance: {
                successRate: 0,
                responseTime: 0,
                adaptationScore: 0,
                workflowMetrics: {
                    activeWorkflows: 0,
                    completionRate: 0,
                    averageExecutionTime: 0
                }
            }
        };
    }

    async processInput(input: string, userId: string): Promise<any> {
        const startTime = Date.now();
        try {
            // Analyse contextuelle
            const contextAnalysis = await contextAnalysisService.analyzeContext(input, this.state.currentContext);
            
            // Vérification des workflows à déclencher
            await this.checkWorkflowTriggers(input, contextAnalysis);
            
            // Apprentissage
            await enhancedLearningService.learn(input, contextAnalysis.contextualFactors);
            
            // Génération de la réponse
            const response = await this.generateResponse(input, contextAnalysis);
            
            // Mise à jour du marketing si pertinent
            if (contextAnalysis.contextualFactors.marketingContext?.campaign) {
                await this.handleMarketingAction(input, contextAnalysis);
            }

            // Tracking des performances
            const processingTime = Date.now() - startTime;
            await this.updatePerformanceMetrics(processingTime, true);

            return response;

        } catch (error) {
            await this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error('Erreur lors du traitement par l\'agent:', error);
            throw error;
        }
    }

    async createWorkflow(workflow: Omit<Workflow, 'id' | 'metadata'>): Promise<Workflow> {
        const newWorkflow: Workflow = {
            ...workflow,
            id: crypto.randomUUID(),
            metadata: {
                created: new Date(),
                lastModified: new Date(),
                successRate: 0
            }
        };

        this.workflows.set(newWorkflow.id, newWorkflow);
        monitoringService.trackMetric('agent.workflow_created', 1);
        
        return newWorkflow;
    }

    private async checkWorkflowTriggers(input: string, context: any): Promise<void> {
        for (const workflow of this.workflows.values()) {
            if (workflow.status !== 'active') continue;

            try {
                if (await this.evaluateTrigger(workflow.trigger, input, context)) {
                    await this.executeWorkflow(workflow, input, context);
                }
            } catch (error) {
                logger.error(`Erreur lors de l'évaluation du workflow ${workflow.id}:`, error);
            }
        }
    }

    private async evaluateTrigger(trigger: WorkflowAction, input: string, context: any): Promise<boolean> {
        try {
            switch (trigger.type) {
                case 'trigger':
                    // Logique d'évaluation du déclencheur
                    return this.evaluateCondition(trigger.config, input, context);
                default:
                    return false;
            }
        } catch (error) {
            logger.error('Erreur lors de l\'évaluation du déclencheur:', error);
            return false;
        }
    }

    private evaluateCondition(config: Record<string, any>, input: string, context: any): boolean {
        // Implémentation de la logique d'évaluation des conditions
        return true; // À personnaliser selon les besoins
    }

    private async executeWorkflow(workflow: Workflow, input: string, context: any): Promise<void> {
        const startTime = Date.now();
        let success = true;

        try {
            this.state.activeWorkflows.push(workflow);

            for (const action of workflow.actions) {
                await this.executeWorkflowAction(action, input, context);
            }

            workflow.metadata.lastExecuted = new Date();
            this.updateWorkflowMetrics(workflow.id, Date.now() - startTime, true);
        } catch (error) {
            success = false;
            logger.error(`Erreur lors de l'exécution du workflow ${workflow.id}:`, error);
            this.updateWorkflowMetrics(workflow.id, Date.now() - startTime, false);
        } finally {
            const index = this.state.activeWorkflows.findIndex(w => w.id === workflow.id);
            if (index !== -1) {
                this.state.activeWorkflows.splice(index, 1);
            }
        }
    }

    private async executeWorkflowAction(action: WorkflowAction, input: string, context: any): Promise<void> {
        const workflowAction: AgentAction = {
            type: 'workflow',
            payload: {
                actionId: action.id,
                input,
                context,
                config: action.config
            },
            priority: 2,
            timestamp: new Date()
        };

        this.actionQueue.push(workflowAction);
        await this.processActionQueue();
    }

    private updateWorkflowMetrics(workflowId: string, executionTime: number, success: boolean): void {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) return;

        // Mise à jour des métriques du workflow
        workflow.metadata.successRate = success ? 
            (workflow.metadata.successRate * 0.9 + 1 * 0.1) : 
            (workflow.metadata.successRate * 0.9);

        // Mise à jour des métriques globales
        this.state.performance.workflowMetrics = {
            activeWorkflows: this.state.activeWorkflows.length,
            completionRate: Array.from(this.workflows.values())
                .reduce((acc, w) => acc + w.metadata.successRate, 0) / this.workflows.size,
            averageExecutionTime: executionTime // À améliorer avec une moyenne mobile
        };

        monitoringService.trackMetric('agent.workflow_execution_time', executionTime);
        monitoringService.trackMetric('agent.workflow_success', success ? 1 : 0);
    }

    private async generateResponse(input: string, analysis: any): Promise<any> {
        try {
            // Utilisation de l'orchestrateur pour le traitement
            const response = await orchestratorService.processMessage(input, 'agent', {
                analysis,
                context: this.state.currentContext
            });

            // Enrichissement de la réponse avec le contexte
            return {
                content: response,
                context: analysis.contextualFactors,
                confidence: analysis.confidence,
                metrics: analysis.metrics
            };
        } catch (error) {
            logger.error('Erreur lors de la génération de réponse:', error);
            throw error;
        }
    }

    private async handleMarketingAction(input: string, analysis: any): Promise<void> {
        const action: AgentAction = {
            type: 'market',
            payload: {
                input,
                context: analysis.contextualFactors.marketingContext
            },
            priority: 1,
            timestamp: new Date()
        };

        this.actionQueue.push(action);
        await this.processActionQueue();
    }

    private async processActionQueue(): Promise<void> {
        while (this.actionQueue.length > 0) {
            const action = this.actionQueue.shift();
            if (!action) continue;

            try {
                switch (action.type) {
                    case 'market':
                        await this.executeMarketingAction(action);
                        break;
                    case 'learn':
                        await this.executeLearningAction(action);
                        break;
                    case 'monitor':
                        await this.executeMonitoringAction(action);
                        break;
                    case 'workflow':
                        await this.executeWorkflowAction(action.payload.action, action.payload.input, action.payload.context);
                        break;
                    default:
                        logger.warn('Type d\'action inconnu:', action.type);
                }
            } catch (error) {
                logger.error('Erreur lors du traitement de l\'action:', error);
            }
        }
    }

    private async executeMarketingAction(action: AgentAction): Promise<void> {
        const { input, context } = action.payload;
        try {
            await this.marketingService.getCampaigns({ status: 'active' });
            monitoringService.trackMetric('agent.marketing_action', 1);
        } catch (error) {
            logger.error('Erreur lors de l\'exécution de l\'action marketing:', error);
        }
    }

    private async executeLearningAction(action: AgentAction): Promise<void> {
        try {
            await enhancedLearningService.learn(action.payload.input, action.payload.context);
            monitoringService.trackMetric('agent.learning_action', 1);
        } catch (error) {
            logger.error('Erreur lors de l\'exécution de l\'action d\'apprentissage:', error);
        }
    }

    private async executeMonitoringAction(action: AgentAction): Promise<void> {
        try {
            monitoringService.trackMetric(`agent.${action.payload.metricName}`, action.payload.value);
        } catch (error) {
            logger.error('Erreur lors de l\'exécution de l\'action de monitoring:', error);
        }
    }

    private async updatePerformanceMetrics(processingTime: number, success: boolean): Promise<void> {
        // Mise à jour des métriques de performance
        this.state.performance.responseTime = processingTime;
        this.state.performance.successRate = success ? 
            (this.state.performance.successRate * 0.9 + 1 * 0.1) : 
            (this.state.performance.successRate * 0.9);

        // Tracking des métriques
        monitoringService.trackMetric('agent.response_time', processingTime);
        monitoringService.trackMetric('agent.success_rate', this.state.performance.successRate);
    }

    async getAgentState(): Promise<AgentState> {
        return this.state;
    }

    async updateContext(newContext: Record<string, any>): Promise<void> {
        this.state.currentContext = {
            ...this.state.currentContext,
            ...newContext
        };
        monitoringService.trackMetric('agent.context_update', 1);
    }
}

export const intelligentAgentService = new IntelligentAgentService(); 