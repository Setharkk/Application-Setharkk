const fs = require('fs');
const path = require('path');

// Liste des extensions de fichiers de configuration
const configExtensions = ['.json', '.yml', '.yaml', '.config.js', '.rc', '.lock'];
const configFileNames = ['package.json', 'package-lock.json', '.env', '.env.example', '.env.production'];

// Fonction pour vérifier si un fichier est un fichier de configuration
function isConfigFile(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    return configExtensions.includes(ext) || configFileNames.includes(fileName);
}

// Fonction pour déplacer un fichier
function moveFile(sourcePath, targetPath) {
    try {
        // Créer le dossier cible s'il n'existe pas
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Déplacer le fichier
        fs.renameSync(sourcePath, targetPath);
        console.log(`Déplacé ${sourcePath} vers ${targetPath}`);
    } catch (error) {
        console.error(`Erreur lors du déplacement de ${sourcePath}: ${error.message}`);
    }
}

// Fonction pour parcourir récursivement les dossiers
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Ignorer les dossiers node_modules, .git, public et config
            if (!['node_modules', '.git', 'public', 'config'].includes(item)) {
                processDirectory(fullPath);
            }
        } else {
            // Déterminer le dossier cible
            const isConfig = isConfigFile(fullPath);
            const targetFolder = isConfig ? 'config' : 'public';
            
            // Construire le chemin cible
            const relativePath = path.relative(process.cwd(), fullPath);
            const targetPath = path.join(process.cwd(), targetFolder, relativePath);

            // Déplacer le fichier
            moveFile(fullPath, targetPath);
        }
    });
}

// Point d'entrée
try {
    processDirectory(process.cwd());
    console.log('Restructuration terminée avec succès');
} catch (error) {
    console.error('Erreur lors de la restructuration:', error.message);
}