import { ESLint } from 'eslint';
import process from 'process';

async function analyzeAndFix() {
    const eslint = new ESLint({ fix: true });

    // Analyse initiale
    console.log("Analyse initiale du projet...");
    const initialResults = await eslint.lintFiles(['**/*.ts', '**/*.js']);
    const initialFormatter = await eslint.loadFormatter('stylish');
    const initialResultText = initialFormatter.format(initialResults);
    console.log(initialResultText);

    // Vérification des erreurs initiales
    const hasInitialErrors = initialResults.some(result => result.errorCount > 0);
    if (hasInitialErrors) {
        console.log("Des erreurs ont été détectées lors de l'analyse initiale. Correction en cours...");

        // Correction des erreurs
        await ESLint.outputFixes(initialResults);

        // Analyse après correction
        console.log("Analyse après correction...");
        const finalResults = await eslint.lintFiles(['**/*.ts', '**/*.js']);
        const finalFormatter = await eslint.loadFormatter('stylish');
        const finalResultText = finalFormatter.format(finalResults);
        console.log(finalResultText);

        const hasFinalErrors = finalResults.some(result => result.errorCount > 0);
        if (hasFinalErrors) {
            console.log("Des erreurs persistent après la correction automatique. Veuillez les corriger manuellement.");
            process.exit(1);
        } else {
            console.log("Toutes les erreurs ont été corrigées automatiquement.");
        }
    } else {
        console.log("Aucune erreur détectée lors de l'analyse initiale.");
    }
}

analyzeAndFix().catch(error => {
    console.error("Erreur lors de l'analyse et de la correction :", error);
    process.exit(1);
});