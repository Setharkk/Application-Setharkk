import { Request, Response, NextFunction, Application } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from '../utils/logger';

// Configuration du rate limiting
export const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  handler: (req: Request, res: Response, next: NextFunction, options: any) => {
    logger.logErreur(new Error('Rate limit exceeded'), {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json(options.message);
  }
});

// Configuration CORS personnalisée
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:80',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 600 // 10 minutes
};

// Configuration Helmet personnalisée
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:80']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" as const }
};

// Middleware de validation des requêtes
export const validateRequest = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Vérification de la taille du body
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 1000000) { // 1MB
    logger.logErreur(new Error('Request too large'), {
      size: contentLength,
      path: req.path
    });
    return res.status(413).json({
      success: false,
      message: 'Requête trop volumineuse'
    });
  }

  // Vérification du content-type
  if (req.method !== 'GET' && !req.is('application/json')) {
    logger.logErreur(new Error('Invalid content type'), {
      contentType: req.headers['content-type'],
      path: req.path
    });
    return res.status(415).json({
      success: false,
      message: 'Content-Type doit être application/json'
    });
  }

  next();
};

// Middleware de sécurité des headers
export const secureHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Suppression des headers sensibles
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Ajout des headers de sécurité
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
};

export const setupSecurity = (app: Application): void => {
  app.use(helmet(helmetConfig));
  app.use(cors(corsOptions));
  app.use(limiter);
  app.use(validateRequest);
  app.use(secureHeaders);
  
  logger.info('Middlewares de sécurité configurés');
}; 