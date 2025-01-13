import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (message: string, context: string[] = []): Promise<string> => {
    try {
        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: "Tu es un assistant intelligent nommé Setharkk. Tu es là pour aider l'utilisateur de manière professionnelle et amicale. Tu réponds toujours en français."
            },
            ...context.map((msg, index) => ({
                role: index % 2 === 0 ? "user" as const : "assistant" as const,
                content: msg
            })),
            {
                role: "user" as const,
                content: message
            }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            temperature: 0.7,
            max_tokens: 500
        });

        return completion.choices[0]?.message?.content ?? "Désolé, je n'ai pas pu générer une réponse.";
    } catch (error) {
        console.error('Erreur OpenAI:', error);
        throw new Error('Erreur lors de la génération de la réponse');
    }
}; 