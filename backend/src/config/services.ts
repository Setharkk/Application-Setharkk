import { BaseService } from '../services/base/BaseService';
import { 
  chatService,
  memoryService,
  mlService,
  agentService,
  workflowService,
  monitoringService,
  metricsService,
  cacheService,
  errorService,
  systemService,
  marketingService,
  seoService,
  crmService,
  prospectionService,
  automationService,
  analysisService,
  learningService
} from '../services';

// Configuration des services
const services: BaseService[] = [
  // Services principaux
  chatService,
  memoryService,
  mlService,
  agentService,
  workflowService,

  // Services d'infrastructure
  monitoringService,
  metricsService,
  cacheService,
  errorService,
  systemService,

  // Services métier
  marketingService,
  seoService,
  crmService,
  prospectionService,
  automationService,
  analysisService,
  learningService
];

// Initialisation des services
export async function initializeServices(): Promise<void> {
  for (const service of services) {
    try {
      await service.initialize();
    } catch (error) {
      console.error(`Erreur lors de l'initialisation du service ${service.getName()}:`, error);
      throw error;
    }
  }
}

// Arrêt des services
export async function shutdownServices(): Promise<void> {
  // Arrêt dans l'ordre inverse de l'initialisation
  const reversedServices = [...services].reverse();
  for (const service of reversedServices) {
    try {
      await service.shutdown();
    } catch (error) {
      console.error(`Erreur lors de l'arrêt du service ${service.getName()}:`, error);
    }
  }
} 