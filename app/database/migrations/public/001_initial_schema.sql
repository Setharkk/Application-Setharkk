-- Migration initiale
BEGIN;

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des analyses SEO
CREATE TABLE seo_analyses (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    title_analysis JSONB,
    meta_analysis JSONB,
    content_analysis JSONB,
    recommendations JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des analyses marketing
CREATE TABLE marketing_analyses (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    metrics JSONB,
    insights JSONB,
    recommendations JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prospects
CREATE TABLE prospects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(100),
    source VARCHAR(50),
    status VARCHAR(20),
    score INTEGER,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des erreurs
CREATE TABLE errors (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    stack_trace TEXT,
    severity VARCHAR(20),
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_seo_analyses_url ON seo_analyses(url);
CREATE INDEX idx_marketing_analyses_url ON marketing_analyses(url);
CREATE INDEX idx_prospects_email ON prospects(email);
CREATE INDEX idx_errors_severity ON errors(severity);
-- Fin de la transaction
COMMIT;