import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useToast } from '@/composables/useToast'

export function useChat() {
  const chatStore = useChatStore()
  const { showToast } = useToast()
  const messagesContainer = ref<HTMLElement | null>(null)

  const scrollToBottom = () => {
    if (messagesContainer.value) {
      setTimeout(() => {
        messagesContainer.value!.scrollTop = messagesContainer.value!.scrollHeight
      }, 100)
    }
  }

  const handleSendMessage = async (content: string, files: File[] = []) => {
    if (!content.trim()) return

    if (!chatStore.activeConversationId) {
      const id = chatStore.createConversation()
      chatStore.setActiveConversation(id)
    }

    try {
      // Ajouter le message de l'utilisateur
      chatStore.addMessage(chatStore.activeConversationId!, {
        content,
        isUser: true,
        timestamp: new Date(),
        attachments: files.map(file => ({
          id: crypto.randomUUID(),
          name: file.name,
          url: URL.createObjectURL(file)
        }))
      })

      // Simuler la réponse de l'assistant
      chatStore.setTyping(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      chatStore.addMessage(chatStore.activeConversationId!, {
        content: `J'ai bien reçu votre message. Comment puis-je vous aider ?`,
        isUser: false,
        timestamp: new Date(),
        attachments: []
      })
    } catch (error) {
      showToast('Erreur lors du traitement de votre message', 'error')
    } finally {
      chatStore.setTyping(false)
      scrollToBottom()
    }
  }

  return {
    messagesContainer,
    scrollToBottom,
    handleSendMessage
  }
} 