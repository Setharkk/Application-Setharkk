import * as prometheus from 'prom-client';
import { Request, Response } from 'express';
import logger from './logger';

// Interface pour les métriques
interface Metrics {
    scenariosTotal: prometheus.Counter<string>;
    scenariosParType: prometheus.Gauge<string>;
    executionsReussies: prometheus.Counter<string>;
    executionsEchouees: prometheus.Counter<string>;
    predictionsGenerees: prometheus.Counter<string>;
    precisionPredictions: prometheus.Gauge<string>;
    analysesEffectuees: prometheus.Counter<string>;
    patternsIdentifies: prometheus.Counter<string>;
    tempsReponseAPI: prometheus.Histogram<string>;
    utilisationMemoire: prometheus.Gauge<string>;
}

// Création du registre Prometheus
const register = new prometheus.Registry();

// Métriques pour les scénarios
const scenariosTotal = new prometheus.Counter({
    name: 'setharkk_scenarios_total',
    help: 'Nombre total de scénarios créés'
});

const scenariosParType = new prometheus.Gauge({
    name: 'setharkk_scenarios_par_type',
    help: 'Nombre de scénarios par type',
    labelNames: ['type']
});

const executionsReussies = new prometheus.Counter({
    name: 'setharkk_executions_reussies_total',
    help: 'Nombre total d\'exécutions réussies'
});

const executionsEchouees = new prometheus.Counter({
    name: 'setharkk_executions_echouees_total',
    help: 'Nombre total d\'exécutions échouées'
});

// Métriques pour les prédictions
const predictionsGenerees = new prometheus.Counter({
    name: 'setharkk_predictions_generees_total',
    help: 'Nombre total de prédictions générées'
});

const precisionPredictions = new prometheus.Gauge({
    name: 'setharkk_precision_predictions',
    help: 'Précision moyenne des prédictions'
});

// Métriques pour l'apprentissage
const analysesEffectuees = new prometheus.Counter({
    name: 'setharkk_analyses_effectuees_total',
    help: 'Nombre total d\'analyses effectuées'
});

const patternsIdentifies = new prometheus.Counter({
    name: 'setharkk_patterns_identifies_total',
    help: 'Nombre total de patterns identifiés'
});

// Métriques de performance
const tempsReponseAPI = new prometheus.Histogram({
    name: 'setharkk_temps_reponse_api_seconds',
    help: 'Temps de réponse de l\'API en secondes',
    buckets: [0.1, 0.5, 1, 2, 5]
});

const utilisationMemoire = new prometheus.Gauge({
    name: 'setharkk_utilisation_memoire_bytes',
    help: 'Utilisation de la mémoire en bytes'
});

// Enregistrement des métriques
register.registerMetric(scenariosTotal);
register.registerMetric(scenariosParType);
register.registerMetric(executionsReussies);
register.registerMetric(executionsEchouees);
register.registerMetric(predictionsGenerees);
register.registerMetric(precisionPredictions);
register.registerMetric(analysesEffectuees);
register.registerMetric(patternsIdentifies);
register.registerMetric(tempsReponseAPI);
register.registerMetric(utilisationMemoire);

// Fonction pour collecter les métriques système
const collectSystemMetrics = (): void => {
    try {
        const used = process.memoryUsage();
        utilisationMemoire.set(used.heapUsed);
    } catch (error) {
        if (error instanceof Error) {
            logger.logErreur(error, { context: 'collecte_metriques_systeme' });
        }
    }
};

// Mise à jour périodique des métriques système
setInterval(collectSystemMetrics, 10000);

const metrics: Metrics = {
    scenariosTotal,
    scenariosParType,
    executionsReussies,
    executionsEchouees,
    predictionsGenerees,
    precisionPredictions,
    analysesEffectuees,
    patternsIdentifies,
    tempsReponseAPI,
    utilisationMemoire
};

const middleware = async (req: Request, res: Response): Promise<void> => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        if (error instanceof Error) {
            logger.logErreur(error, { context: 'metrics_endpoint' });
        }
        res.status(500).end();
    }
};

export { register, metrics, middleware }; 