import winston from 'winston';
const { format } = winston;

interface Scenario {
    scenario_id: string;
    type: string;
    nom: string;
}

interface Prediction {
    type: string;
    probabilite: number;
    contexte_optimal: string;
}

interface Analyse {
    patterns_identifies: string[];
    complexite: number;
    potentiel_automation: number;
}

interface CustomLogger extends winston.Logger {
    logScenarioCreation(scenario: Scenario): void;
    logPrediction(prediction: Prediction): void;
    logApprentissage(analyse: Analyse): void;
    logErreur(err: Error, context?: Record<string, unknown>): void;
    logPerformance(operation: string, duree: number): void;
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'setharkk-backend' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
}) as CustomLogger;

// Logs dans la console en développement
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

// Fonctions de logging personnalisées
logger.logScenarioCreation = (scenario: Scenario): void => {
    logger.info('Nouveau scénario créé', {
        scenario_id: scenario.scenario_id,
        type: scenario.type,
        nom: scenario.nom
    });
};

logger.logPrediction = (prediction: Prediction): void => {
    logger.info('Prédiction générée', {
        type: prediction.type,
        probabilite: prediction.probabilite,
        contexte: prediction.contexte_optimal
    });
};

logger.logApprentissage = (analyse: Analyse): void => {
    logger.info('Apprentissage effectué', {
        patterns_identifies: analyse.patterns_identifies,
        complexite: analyse.complexite,
        potentiel_automation: analyse.potentiel_automation
    });
};

logger.logErreur = (err: Error, context: Record<string, unknown> = {}): void => {
    logger.error('Erreur survenue', {
        nom: err.name,
        message: err.message,
        stack: err.stack,
        ...context
    });
};

logger.logPerformance = (operation: string, duree: number): void => {
    logger.info('Mesure de performance', {
        operation,
        duree_ms: duree,
        timestamp: Date.now()
    });
};

export default logger; 