import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface KeywordResult {
    type: string;
    keyword: string;
    importance: 'high' | 'medium' | 'low';
}

interface SeoSuggestion {
    category: string;
    suggestions: string[];
}

class AIManager {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    // Optimiser le contenu
    async optimizeContent(content: string, keywords: string[]): Promise<string> {
        try {
            const prompt = this.buildOptimizationPrompt(content, keywords);
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Vous êtes un expert en SEO qui optimise le contenu tout en maintenant un style naturel." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erreur lors de l\'optimisation du contenu:', error);
            throw error;
        }
    }

    // Générer des suggestions SEO
    async generateSeoSuggestions(content: string): Promise<string[]> {
        try {
            const prompt = this.buildSeoAnalysisPrompt(content);
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Vous êtes un expert SEO qui fournit des suggestions d'amélioration." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.5
            });

            return this.parseSuggestions(response.choices[0].message.content);
        } catch (error) {
            console.error('Erreur lors de la génération des suggestions:', error);
            throw error;
        }
    }

    // Analyser les mots-clés
    async analyzeKeywords(content: string): Promise<KeywordResult[]> {
        try {
            const prompt = this.buildKeywordAnalysisPrompt(content);
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "Vous êtes un expert en analyse de mots-clés SEO." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 300,
                temperature: 0.3
            });

            return this.parseKeywordAnalysis(response.choices[0].message.content);
        } catch (error) {
            console.error('Erreur lors de l\'analyse des mots-clés:', error);
            throw error;
        }
    }

    // Construire le prompt pour l'optimisation
    private buildOptimizationPrompt(content: string, keywords: string[]): string {
        return `Optimisez le contenu suivant en intégrant naturellement les mots-clés ${keywords.join(', ')} 
                tout en maintenant un style naturel et engageant :

                ${content}

                Instructions :
                1. Maintenir le message principal
                2. Améliorer la lisibilité
                3. Intégrer les mots-clés naturellement
                4. Optimiser pour le SEO`;
    }

    // Construire le prompt pour l'analyse SEO
    private buildSeoAnalysisPrompt(content: string): string {
        return `Analysez le contenu suivant et fournissez des suggestions d'amélioration SEO :

                ${content}

                Fournissez des suggestions spécifiques pour :
                1. Structure du contenu
                2. Utilisation des mots-clés
                3. Méta-descriptions
                4. Balises de titre
                5. Liens internes/externes`;
    }

    // Construire le prompt pour l'analyse des mots-clés
    private buildKeywordAnalysisPrompt(content: string): string {
        return `Analysez le contenu suivant et identifiez :
                1. Les mots-clés principaux
                2. Les mots-clés secondaires
                3. Les opportunités de mots-clés manquants
                4. La densité des mots-clés

                ${content}`;
    }

    // Parser les suggestions
    private parseSuggestions(text: string): string[] {
        return text.split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }

    // Parser l'analyse des mots-clés
    private parseKeywordAnalysis(text: string): KeywordResult[] {
        const lines = text.split('\n').filter(line => line.trim());
        const keywords: KeywordResult[] = [];

        let currentCategory = '';
        for (const line of lines) {
            if (line.includes(':')) {
                currentCategory = line.split(':')[0].trim();
            } else if (line.trim() && currentCategory) {
                keywords.push({
                    type: currentCategory,
                    keyword: line.trim(),
                    importance: currentCategory.includes('principal') ? 'high' : 'medium'
                });
            }
        }

        return keywords;
    }
}

export default new AIManager(); 