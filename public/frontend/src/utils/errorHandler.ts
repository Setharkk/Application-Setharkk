import { useStore } from 'vuex';
import logger from '../services/logger';

// Types d'erreurs
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  API: 'API_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const;

export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes];

interface ErrorDetails {
  [key: string]: unknown;
}

interface SerializedAppError {
  name: string;
  message: string;
  type: ErrorType;
  details: ErrorDetails;
  timestamp: string;
}

interface NotificationPayload {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration: number;
}

// Classe d'erreur personnalisée
export class AppError extends Error {
  public readonly name: string;
  public readonly type: ErrorType;
  public readonly details: ErrorDetails;
  public readonly timestamp: string;

  constructor(message: string, type: ErrorType = ErrorTypes.UNKNOWN, details: ErrorDetails = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): SerializedAppError {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

// Gestionnaire d'erreur principal
export const handleError = (error: Error | AppError, context: ErrorDetails = {}): AppError => {
  const store = useStore();
  
  // Conversion en AppError si nécessaire
  const appError = error instanceof AppError 
    ? error 
    : new AppError(
        error.message || 'Une erreur inattendue est survenue',
        (error as any).type || ErrorTypes.UNKNOWN,
        { ...((error as any).details || {}), ...context }
      );

  // Log de l'erreur
  logger.error('Application error:', {
    ...appError.toJSON(),
    stack: error.stack,
    context
  });

  // Notification à l'utilisateur via le store
  store.dispatch('error/addError', appError.toJSON());

  // Gestion spécifique selon le type d'erreur
  switch (appError.type) {
    case ErrorTypes.NETWORK:
      store.dispatch('app/checkConnectivity');
      break;
    case ErrorTypes.AUTH:
      store.dispatch('auth/handleAuthError');
      break;
    case ErrorTypes.VALIDATION:
      store.dispatch('error/addNotification', {
        message: appError.message,
        type: 'warning',
        duration: 5000
      } as NotificationPayload);
      break;
    default:
      store.dispatch('error/addNotification', {
        message: 'Une erreur est survenue, veuillez réessayer',
        type: 'error',
        duration: 8000
      } as NotificationPayload);
  }

  return appError;
};

// Utilitaire pour créer des erreurs typées
export const createError = (
  message: string,
  type: ErrorType = ErrorTypes.UNKNOWN,
  details: ErrorDetails = {}
): AppError => {
  return new AppError(message, type, details);
};

// Décorateur pour la gestion automatique des erreurs
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorContext: ErrorDetails = {}
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error as Error, errorContext);
      throw error;
    }
  };
}; 