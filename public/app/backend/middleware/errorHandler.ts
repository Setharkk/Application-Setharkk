import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

interface CustomError extends Error {
  name: string;
  errors?: { [key: string]: { message: string } };
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  details?: string | string[];
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): Response<ErrorResponse> => {
  console.error(err.stack);

  // Erreurs de validation MongoDB
  if (err.name === 'ValidationError' && err instanceof MongooseError.ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erreurs de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
      details: err.message
    });
  }

  // Erreurs d'authentification
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé',
      details: err.message
    });
  }

  // Erreurs de rate limit
  if (err.name === 'TooManyRequests') {
    return res.status(429).json({
      success: false,
      message: 'Trop de requêtes',
      details: err.message
    });
  }

  // Erreurs de l'API Make
  if (err.name === 'MakeAPIError') {
    return res.status(502).json({
      success: false,
      message: 'Erreur de l\'API Make',
      details: err.message
    });
  }

  // Erreurs de prédiction
  if (err.name === 'PredictionError') {
    return res.status(500).json({
      success: false,
      message: 'Erreur de prédiction',
      details: err.message
    });
  }

  // Erreur par défaut
  return res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
}; 