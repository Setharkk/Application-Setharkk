import { openai, openaiConfig } from '../../config/openai';
import { ChatCompletionRequestMessage } from 'openai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class ChatController {
  private context: ChatMessage[];

  constructor() {
    this.context = [
      {
        role: 'system',
        content: `Je suis un assistant spécialisé en SEO et en analyse de contenu web. 
        Je peux vous aider à optimiser vos pages web, analyser leur performance SEO, 
        et vous donner des conseils pour améliorer votre visibilité sur les moteurs de recherche.
        Je peux également vous aider avec la rédaction de contenu optimisé pour le SEO.`
      }
    ];
  }

  async sendMessage(message: string): Promise<string> {
    try {
      this.context.push({
        role: 'user',
        content: message
      });

      const response = await openai.createChatCompletion({
        ...openaiConfig,
        messages: this.context as ChatCompletionRequestMessage[]
      });

      const reply = response.data.choices[0].message?.content;
      
      if (!reply) {
        throw new Error('Réponse vide de l\'assistant');
      }

      this.context.push({
        role: 'assistant',
        content: reply
      });

      // Garder seulement les 10 derniers messages pour éviter de dépasser les limites
      if (this.context.length > 11) { // 1 system + 10 messages
        this.context = [
          this.context[0],
          ...this.context.slice(-10)
        ];
      }

      return reply;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error('Impossible d\'obtenir une réponse de l\'assistant');
    }
  }

  clearContext(): void {
    this.context = [this.context[0]]; // Garder uniquement le message système
  }
} 