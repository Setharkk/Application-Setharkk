import OpenAI from 'openai';

export interface Config {
    apiKey: string;
}

export class OpenAIService {
    private readonly openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000,
                temperature: 0.7
            });

            return response.choices[0]?.message?.content?.trim() || '';
        } catch (error) {
            console.error('Erreur lors de la génération de texte:', error);
            throw error;
        }
    }

    async analyze(content: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Analyze the following content: ${content}` }],
                max_tokens: 1000,
                temperature: 0.5
            });

            return response.choices[0]?.message?.content?.trim() || '';
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            throw error;
        }
    }
} 