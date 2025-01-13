import CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
}

export const createCircuitBreaker = (
  asyncFunction: (...args: any[]) => Promise<any>,
  options: CircuitBreakerOptions = {}
) => {
  const defaultOptions = {
    timeout: 3000,                    // Si une requête prend plus de 3s
    errorThresholdPercentage: 50,     // Si 50% des requêtes échouent
    resetTimeout: 30000,              // Attendre 30s avant de réessayer
    ...options
  };

  const breaker = new CircuitBreaker(asyncFunction, defaultOptions);

  breaker.on('success', () => {
    console.log('Circuit Breaker: Opération réussie');
  });

  breaker.on('timeout', () => {
    console.log('Circuit Breaker: Timeout - Circuit ouvert');
  });

  breaker.on('reject', () => {
    console.log('Circuit Breaker: Rejet - Circuit ouvert');
  });

  breaker.on('open', () => {
    console.log('Circuit Breaker: Circuit ouvert');
  });

  breaker.on('halfOpen', () => {
    console.log('Circuit Breaker: Circuit semi-ouvert');
  });

  breaker.on('close', () => {
    console.log('Circuit Breaker: Circuit fermé');
  });

  return breaker;
}; 