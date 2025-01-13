USE setharkk_db;

-- Insertion d'utilisateurs de test
INSERT INTO users (username, email, password_hash) VALUES
('test_user', 'test@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
('admin_user', 'admin@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz789012');

-- Insertion de conversations de test
INSERT INTO conversations (user_id, title) VALUES
(1, 'Première conversation'),
(1, 'Discussion SEO'),
(2, 'Analyse de contenu');

-- Insertion de messages de test
INSERT INTO messages (conversation_id, content, role) VALUES
(1, 'Bonjour, comment puis-je optimiser mon contenu ?', 'user'),
(1, 'Je peux vous aider à analyser et améliorer votre contenu. Commençons par examiner vos mots-clés.', 'assistant'),
(2, 'Pouvez-vous analyser le SEO de ma page ?', 'user'),
(2, 'Bien sûr, je vais effectuer une analyse complète de votre page.', 'assistant');

-- Insertion de documents d'édition de test
INSERT INTO editor_documents (user_id, title, content) VALUES
(1, 'Article sur le SEO', 'Le SEO est essentiel pour la visibilité en ligne...'),
(2, 'Guide Marketing', 'Le marketing digital comprend plusieurs aspects...');

-- Insertion d'analyses SEO de test
INSERT INTO seo_analyses (document_id, score, recommendations) VALUES
(1, 85, 'Ajouter plus de mots-clés pertinents. Optimiser les balises meta.'),
(2, 92, 'Le contenu est bien optimisé. Suggère d''ajouter plus d''images.');

-- Insertion de mots-clés SEO de test
INSERT INTO seo_keywords (document_id, keyword, density, suggestions) VALUES
(1, 'SEO', 2.5, 'Densité de mots-clés optimale'),
(1, 'optimisation', 1.8, 'Augmenter légèrement la fréquence'),
(2, 'marketing digital', 3.0, 'Bien équilibré');
