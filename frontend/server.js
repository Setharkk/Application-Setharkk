import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Servir les fichiers statiques du dossier dist
app.use(express.static(join(__dirname, 'dist')));

// Route pour toutes les autres requêtes -> renvoyer index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server running at http://0.0.0.0:${port}`);
}); 