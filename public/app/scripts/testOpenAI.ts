import * as aiManager from './ai';

interface SeoSuggestions {
    title?: string;
    description?: string;
    headings?: string[];
    content?: string[];
}

interface KeywordAnalysis {
    keyword: string;
    relevance: number;
    frequency: number;
}

async function runAllTests(): Promise<void> {
    console.log('🚀 Démarrage des tests OpenAI...\n');
    
    // Test 1: Connexion de base
    await testConnection();
    
    // Test 2: Optimisation de contenu
    await testContentOptimization();
    
    // Test 3: Analyse SEO
    await testSeoAnalysis();
    
    // Test 4: Analyse des mots-clés
    await testKeywordAnalysis();
    
    console.log('\n✨ Tous les tests sont terminés !');
}

async function testConnection(): Promise<boolean> {
    try {
        console.log('📡 Test 1: Vérification de la connexion...');
        const testContent = 'Test de connexion à l\'API OpenAI.';
        const testKeywords = ['test'];
        await aiManager.optimizeContent(testContent, testKeywords);
        console.log('✅ Connexion établie avec succès\n');
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Erreur de connexion:', error.message, '\n');
        } else {
            console.error('❌ Erreur de connexion inconnue\n');
        }
        return false;
    }
}

async function testContentOptimization(): Promise<boolean> {
    try {
        console.log('📝 Test 2: Optimisation de contenu...');
        const content = 'Les voitures électriques sont l\'avenir du transport automobile.';
        const keywords = ['voiture électrique', 'transport durable'];
        
        const result = await aiManager.optimizeContent(content, keywords);
        console.log('Résultat:', result);
        console.log('✅ Test d\'optimisation réussi\n');
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Erreur d\'optimisation:', error.message, '\n');
        } else {
            console.error('❌ Erreur d\'optimisation inconnue\n');
        }
        return false;
    }
}

async function testSeoAnalysis(): Promise<boolean> {
    try {
        console.log('🔍 Test 3: Analyse SEO...');
        const content = `
            <title>Guide des voitures électriques</title>
            <meta name="description" content="Découvrez tout sur les voitures électriques">
            <h1>Les voitures électriques</h1>
            <p>Les voitures électriques représentent l'avenir du transport.</p>
        `;
        
        const suggestions: SeoSuggestions = await aiManager.generateSeoSuggestions(content);
        console.log('Suggestions:', suggestions);
        console.log('✅ Test d\'analyse SEO réussi\n');
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Erreur d\'analyse SEO:', error.message, '\n');
        } else {
            console.error('❌ Erreur d\'analyse SEO inconnue\n');
        }
        return false;
    }
}

async function testKeywordAnalysis(): Promise<boolean> {
    try {
        console.log('🎯 Test 4: Analyse des mots-clés...');
        const content = `
            Les voitures électriques sont de plus en plus populaires.
            Ces véhicules écologiques offrent une alternative durable aux voitures traditionnelles.
            L'autonomie des batteries s'améliore constamment, rendant les voitures électriques plus pratiques.
        `;
        
        const keywords: KeywordAnalysis[] = await aiManager.analyzeKeywords(content);
        console.log('Mots-clés identifiés:', keywords);
        console.log('✅ Test d\'analyse des mots-clés réussi\n');
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Erreur d\'analyse des mots-clés:', error.message, '\n');
        } else {
            console.error('❌ Erreur d\'analyse des mots-clés inconnue\n');
        }
        return false;
    }
}

// Exécuter tous les tests
runAllTests(); 