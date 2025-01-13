import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

interface DatabaseRequest extends Request {
  db?: Pool;
}

const pool = new Pool({
  user: process.env.DB_USER || 'setharkk_app',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'setharkk',
  password: process.env.DB_PASSWORD || 'Setharkk_2024_Secure!',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const database = async (
  req: DatabaseRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Attacher le client à la requête
    req.db = pool;
    next();
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return res.status(500).json({ message: 'Erreur de connexion à la base de données' });
  }
}; 