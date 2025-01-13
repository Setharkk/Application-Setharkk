import { Request, Response, NextFunction } from 'express';
import { metrics } from './metrics';
import logger from './logger';

interface CustomResponse extends Response {
    send: (data: any) => void;
}

interface MonitoringError extends Error {
    status?: number;
}

const monitorPerformance = (req: Request, res: CustomResponse, next: NextFunction): void => {
    const startTime = process.hrtime();
    const oldSend = res.send;

    res.send = function(data: any): void {
        const endTime = process.hrtime(startTime);
        const responseTime = endTime[0] * 1000 + endTime[1] / 1000000;

        // Enregistrer les métriques
        metrics.tempsReponseAPI.observe(responseTime / 1000); // Convertir en secondes
        metrics.utilisationMemoire.set(process.memoryUsage().heapUsed);

        // Logger les performances si nécessaire
        if (responseTime > 1000) {
            logger.logErreur(new Error('Réponse lente détectée'), {
                path: req.path,
                method: req.method,
                responseTime,
                memoryUsage: process.memoryUsage().heapUsed
            });
        }

        oldSend.apply(res, [data]);
    };

    next();
};

const monitorErrors = (error: MonitoringError, req: Request, res: Response, next: NextFunction): void => {
    // Enregistrer l'erreur dans les métriques
    metrics.executionsEchouees.inc();

    // Logger l'erreur
    logger.logErreur(error, {
        path: req.path,
        method: req.method,
        status: error.status || 500
    });

    next(error);
};

const monitorRoute = (req: Request, res: Response, next: NextFunction): void => {
    // Enregistrer l'accès à la route dans les métriques
    metrics.analysesEffectuees.inc();

    // Logger l'accès
    logger.info('Accès route', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    next();
};

export {
    monitorPerformance,
    monitorErrors,
    monitorRoute
}; 