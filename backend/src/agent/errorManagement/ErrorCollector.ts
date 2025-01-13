interface ErrorContext {
    input: any;
    context: any;
    timestamp: Date;
}

export class ErrorCollector {
    constructor() {}

    async collectError(error: any, context: ErrorContext): Promise<void> {
        // Logique de collecte d'erreur
        const { input, timestamp } = context;
        // Implémentation de la collecte
    }
} 