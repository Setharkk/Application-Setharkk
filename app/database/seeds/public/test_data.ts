import { Knex } from 'knex';

interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
}

interface SeoAnalysis {
  url: string;
  score: number;
  title_analysis: string;
  user_id: number;
}

interface MarketingAnalysis {
  url: string;
  metrics: string;
  user_id: number;
}

interface Prospect {
  name: string;
  email: string;
  company: string;
  source: string;
  status: string;
  score: number;
  user_id: number;
}

interface Error {
  message: string;
  severity: 'WARNING' | 'ERROR' | 'INFO';
  context: string;
}

export async function seed(knex: Knex): Promise<void> {
    // Vider les tables existantes
    await knex('errors').del();
    await knex('seo_analyses').del();
    await knex('marketing_analyses').del();
    await knex('prospects').del();
    await knex('users').del();

    // Insérer les utilisateurs de test
    const users = await knex<User>('users').insert([
        {
            username: 'admin',
            email: 'admin@setharkk.com',
            password_hash: '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // À remplacer par un vrai hash
        },
        {
            username: 'test_user',
            email: 'test@setharkk.com',
            password_hash: '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // À remplacer par un vrai hash
        }
    ]).returning('id');

    // Insérer les analyses SEO de test
    await knex<SeoAnalysis>('seo_analyses').insert([
        {
            url: 'https://example.com',
            score: 85,
            title_analysis: JSON.stringify({
                score: 90,
                recommendations: ['Optimiser le titre']
            }),
            user_id: users[0].id as number
        }
    ]);

    // Insérer les analyses marketing de test
    await knex<MarketingAnalysis>('marketing_analyses').insert([
        {
            url: 'https://example.com',
            metrics: JSON.stringify({
                visitors: 1000,
                conversions: 50
            }),
            user_id: users[0].id as number
        }
    ]);

    // Insérer les prospects de test
    await knex<Prospect>('prospects').insert([
        {
            name: 'Entreprise Test',
            email: 'contact@entreprise-test.com',
            company: 'Entreprise Test SARL',
            source: 'LinkedIn',
            status: 'Nouveau',
            score: 75,
            user_id: users[0].id as number
        }
    ]);

    // Insérer les erreurs de test
    await knex<Error>('errors').insert([
        {
            message: 'Erreur de test',
            severity: 'WARNING',
            context: JSON.stringify({
                route: '/api/test',
                method: 'GET'
            })
        }
    ]);
} 