import axios from 'axios';
import { createCircuitBreaker } from '../utils/circuitBreaker';

export class ExternalService {
  private apiClient;

  constructor() {
    // Création d'un circuit breaker pour les appels API externes
    this.apiClient = createCircuitBreaker(
      async (url: string) => {
        const response = await axios.get(url);
        return response.data;
      },
      {
        timeout: 5000,                    // 5 secondes de timeout
        errorThresholdPercentage: 30,     // 30% d'erreurs tolérées
        resetTimeout: 10000               // 10 secondes avant réinitialisation
      }
    );
  }

  async fetchExternalData(url: string) {
    try {
      return await this.apiClient.fire(url);
    } catch (error) {
      if (error.type === 'open') {
        throw new Error('Service temporairement indisponible - Circuit ouvert');
      }
      throw error;
    }
  }
} 