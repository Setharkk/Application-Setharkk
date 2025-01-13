interface ErrorData {
    input: any;
    context: any;
    timestamp: Date;
}

export class ErrorLearning {
    async learnFromError(error: any, data: ErrorData): Promise<void> {
        // Logique d'apprentissage des erreurs
        // Implémentation de l'apprentissage
    }
} 