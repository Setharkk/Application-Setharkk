import OpenAI from 'openai';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ResponseData {
    message: string;
    suggestions?: string[];
}

interface ServiceResponse {
    success: boolean;
    message?: string;
    suggestions?: string[];
    error?: string;
}

type ActionType = 'seo' | 'content' | 'metrics' | 'marketing';

class ChatService {
    private openai: OpenAI;
    private conversationContext: Map<string, ChatMessage[]>;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.conversationContext = new Map();
    }

    async processMessage(userId: string, message: string): Promise<ServiceResponse> {
        try {
            // Récupérer l'historique de la conversation
            const userContext = this.conversationContext.get(userId) || [];

            // Ajouter le message de l'utilisateur au contexte
            userContext.push({
                role: 'user',
                content: message
            });

            // Générer la réponse avec l'IA
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: 'system',
                        content: `Vous êtes un assistant SEO et marketing expert. 
                        Aidez l'utilisateur avec ses questions sur le SEO, le marketing digital et l'optimisation de contenu.
                        Fournissez des suggestions pertinentes basées sur le contexte de la conversation.
                        Format de réponse souhaité : {message: string, suggestions?: string[]}`
                    },
                    ...userContext
                ],
                temperature: 0.7,
                max_tokens: 500,
                functions: [
                    {
                        name: "formatResponse",
                        description: "Formate la réponse avec le message principal et les suggestions",
                        parameters: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "Le message principal de la réponse"
                                },
                                suggestions: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "Liste de suggestions pertinentes pour la suite de la conversation"
                                }
                            },
                            required: ["message"]
                        }
                    }
                ],
                function_call: { name: "formatResponse" }
            });

            const responseData = JSON.parse(completion.choices[0].message.function_call.arguments) as ResponseData;

            // Ajouter la réponse au contexte
            userContext.push({
                role: 'assistant',
                content: responseData.message
            });

            // Limiter la taille du contexte (garder les 10 derniers messages)
            if (userContext.length > 10) {
                userContext.splice(0, userContext.length - 10);
            }

            // Mettre à jour le contexte
            this.conversationContext.set(userId, userContext);

            return {
                success: true,
                message: responseData.message,
                suggestions: responseData.suggestions || []
            };
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            return {
                success: false,
                error: 'Erreur lors du traitement du message'
            };
        }
    }

    async processAction(userId: string, action: ActionType): Promise<ServiceResponse> {
        try {
            const prompts: Record<ActionType, string> = {
                seo: "Effectuez une analyse SEO rapide et fournissez des recommandations clés.",
                content: "Donnez des conseils pour optimiser le contenu et améliorer son impact.",
                metrics: "Analysez les métriques principales et identifiez les points d'amélioration.",
                marketing: "Proposez des stratégies marketing efficaces et des actions concrètes."
            };

            const prompt = prompts[action] || "Comment puis-je vous aider ?";

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: 'system',
                        content: `Vous êtes un expert en ${action}. ${prompt}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 500,
                functions: [
                    {
                        name: "formatResponse",
                        description: "Formate la réponse avec le message principal et les suggestions",
                        parameters: {
                            type: "object",
                            properties: {
                                message: {
                                    type: "string",
                                    description: "Le message principal de la réponse"
                                },
                                suggestions: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "Liste de suggestions pertinentes pour la suite"
                                }
                            },
                            required: ["message"]
                        }
                    }
                ],
                function_call: { name: "formatResponse" }
            });

            const responseData = JSON.parse(completion.choices[0].message.function_call.arguments) as ResponseData;

            return {
                success: true,
                message: responseData.message,
                suggestions: responseData.suggestions || []
            };
        } catch (error) {
            console.error('Erreur lors du traitement de l\'action:', error);
            return {
                success: false,
                error: 'Erreur lors du traitement de l\'action'
            };
        }
    }

    clearContext(userId: string): ServiceResponse {
        this.conversationContext.delete(userId);
        return {
            success: true,
            message: 'Contexte de conversation effacé'
        };
    }
}

export default new ChatService(); 