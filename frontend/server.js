const express = require('express');
const path = require('path');

const app = express();
const port = process.env.VITE_PORT || 10000;

// Servir les fichiers statiques du dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour toutes les autres requêtes -> renvoyer index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server running at http://0.0.0.0:${port}`);
}); 