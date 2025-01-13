import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

interface ValidationSchema {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

interface MessageRequest extends Request {
  body: {
    message: string;
    action?: string;
    url?: string;
  };
}

type ValidAction = 'seo' | 'editor' | 'pause' | 'resume';

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      if (schema.body) {
        const { error } = schema.body.validate(req.body);
        if (error) throw new Error(error.details[0].message);
      }
      if (schema.query) {
        const { error } = schema.query.validate(req.query);
        if (error) throw new Error(error.details[0].message);
      }
      if (schema.params) {
        const { error } = schema.params.validate(req.params);
        if (error) throw new Error(error.details[0].message);
      }
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Une erreur est survenue' });
    }
  };
};

export const validateMessage = (
  req: MessageRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Le message ne peut pas être vide'
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Le message ne peut pas dépasser 1000 caractères'
    });
  }

  next();
};

export const validateAction = (
  req: MessageRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  const { action } = req.body;
  const validActions: ValidAction[] = ['seo', 'editor', 'pause', 'resume'];

  if (!action || !validActions.includes(action as ValidAction)) {
    return res.status(400).json({
      success: false,
      message: 'Action invalide'
    });
  }

  next();
};

export const validateSEOData = (
  req: MessageRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({
      success: false,
      message: 'URL invalide'
    });
  }

  next();
}; 