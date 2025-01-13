const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkDependencies(directory) {
  console.log(`\nVérification des dépendances dans ${directory}`);
  
  const packageJsonPath = path.join(directory, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('Aucun package.json trouvé');
    return;
  }

  try {
    // Vérifier les mises à jour disponibles
    console.log('\nMises à jour disponibles :');
    execSync('npm outdated', { cwd: directory, stdio: 'inherit' });
  } catch (error) {
    // npm outdated renvoie un code d'erreur s'il y a des mises à jour
    console.log('Des mises à jour sont disponibles');
  }

  try {
    // Vérifier les vulnérabilités
    console.log('\nVérification des vulnérabilités :');
    execSync('npm audit', { cwd: directory, stdio: 'inherit' });
  } catch (error) {
    console.error('Des vulnérabilités ont été détectées');
  }

  try {
    // Vérifier les dépendances obsolètes
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { 
      ...(packageJson.dependencies || {}), 
      ...(packageJson.devDependencies || {}) 
    };
    
    console.log('\nDépendances obsolètes :');
    for (const [pkg, version] of Object.entries(dependencies)) {
      if (version.startsWith('^') || version.startsWith('~')) {
        console.log(`${pkg}: Version flottante détectée (${version})`);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du package.json:', error.message);
  }
}

// Vérifier les dépendances dans tous les sous-projets
const projectDirs = [
  '.',
  './frontend',
  './backend',
  './metrics-collector'
];

projectDirs.forEach(checkDependencies); 