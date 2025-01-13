import natural from 'natural';
const tokenizer = new natural.WordTokenizer();

interface MetaTagAnalysis {
    length: number;
    isOptimalLength: boolean;
}

interface HeadingAnalysis {
    count: number;
    isOptimal: boolean;
}

interface SeoAnalysis {
    wordCount: number;
    keywordDensity: number;
    readabilityScore: number;
    headingsAnalysis: {
        h1: HeadingAnalysis;
        h2: HeadingAnalysis;
    };
    metaAnalysis: {
        title: MetaTagAnalysis;
        description: MetaTagAnalysis;
    };
}

class SeoAnalyzer {
    // Analyser le contenu
    static analyzeContent(content: string): SeoAnalysis {
        return {
            wordCount: this.getWordCount(content),
            keywordDensity: this.calculateKeywordDensity(content, ''), // Nécessite un mot-clé par défaut
            readabilityScore: this.calculateReadability(content),
            headingsAnalysis: this.analyzeHeadings(content),
            metaAnalysis: this.analyzeMetaTags(content)
        };
    }

    // Compter les mots
    static getWordCount(text: string): number {
        const words = tokenizer.tokenize(text);
        return words ? words.length : 0;
    }

    // Calculer la densité des mots-clés
    static calculateKeywordDensity(text: string, keyword: string): number {
        const words = tokenizer.tokenize(text.toLowerCase());
        if (!words) return 0;
        const keywordCount = words.filter(word => word === keyword.toLowerCase()).length;
        return (keywordCount / words.length) * 100;
    }

    // Calculer la lisibilité (Flesch Reading Ease)
    static calculateReadability(text: string): number {
        const words = this.getWordCount(text);
        const sentences = text.split(/[.!?]+/).length;
        const syllables = this.countSyllables(text);

        if (sentences === 0 || words === 0) return 0;
        return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    }

    // Compter les syllabes
    static countSyllables(text: string): number {
        return text.toLowerCase()
            .replace(/[^a-z]/g, '')
            .replace(/[^aeiou]+/g, ' ')
            .trim()
            .length;
    }

    // Analyser les balises meta
    static analyzeMetaTags(content: string): { title: MetaTagAnalysis; description: MetaTagAnalysis } {
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        const descriptionMatch = content.match(/<meta name="description" content="(.*?)"/i);
        
        const title = titleMatch?.[1] || '';
        const description = descriptionMatch?.[1] || '';
        
        return {
            title: {
                length: title.length,
                isOptimalLength: title.length >= 30 && title.length <= 60
            },
            description: {
                length: description.length,
                isOptimalLength: description.length >= 120 && description.length <= 160
            }
        };
    }

    // Analyser les titres
    static analyzeHeadings(content: string): { h1: HeadingAnalysis; h2: HeadingAnalysis } {
        const h1Count = (content.match(/<h1/g) || []).length;
        const h2Count = (content.match(/<h2/g) || []).length;
        
        return {
            h1: {
                count: h1Count,
                isOptimal: h1Count === 1
            },
            h2: {
                count: h2Count,
                isOptimal: h2Count > 0
            }
        };
    }

    // Générer des suggestions
    static generateSuggestions(analysis: SeoAnalysis): string[] {
        const suggestions: string[] = [];

        if (!analysis.metaAnalysis.title.isOptimalLength) {
            suggestions.push('Optimisez la longueur du titre (30-60 caractères)');
        }

        if (!analysis.metaAnalysis.description.isOptimalLength) {
            suggestions.push('Optimisez la longueur de la description (120-160 caractères)');
        }

        if (!analysis.headingsAnalysis.h1.isOptimal) {
            suggestions.push('Utilisez une seule balise H1 par page');
        }

        if (analysis.readabilityScore < 60) {
            suggestions.push('Améliorez la lisibilité du texte');
        }

        return suggestions;
    }
}

export default SeoAnalyzer; 