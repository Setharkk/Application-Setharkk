import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  attachments: Array<{
    id: string
    name: string
    url: string
  }>
}

interface Conversation {
  id: string
  title: string
  lastMessage?: string
  lastActivity: Date
  messages: Message[]
  preview?: string
}

interface ChatResponse {
  message: string
  timestamp: string
  data?: any
}

export const useChatStore = defineStore('chat', () => {
  // État
  const conversations = ref<Conversation[]>([])
  const activeConversationId = ref<string | undefined>(undefined)
  const isTyping = ref(false)

  // Getters
  const activeConversation = computed(() => 
    conversations.value.find(conv => conv.id === activeConversationId.value)
  )

  // Actions
  function setActiveConversation(id: string) {
    activeConversationId.value = id
  }

  function createConversation() {
    const id = crypto.randomUUID()
    const newConversation: Conversation = {
      id,
      title: 'Nouvelle conversation',
      lastActivity: new Date(),
      messages: [],
      preview: ''
    }
    conversations.value.push(newConversation)
    return id
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(conv => conv.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (activeConversationId.value === id) {
        activeConversationId.value = conversations.value[0]?.id
      }
    }
  }

  function renameConversation(id: string, newTitle: string) {
    const conversation = conversations.value.find(conv => conv.id === id)
    if (conversation) {
      conversation.title = newTitle
      conversation.preview = `Conversation renommée en "${newTitle}"`
    }
  }

  function addMessage(conversationId: string, message: Omit<Message, 'id'>) {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        ...message
      }
      conversation.messages.push(newMessage)
      conversation.lastMessage = message.content
      conversation.lastActivity = message.timestamp
      conversation.preview = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
    }
  }

  function setTyping(typing: boolean) {
    isTyping.value = typing
  }

  async function fetchConversations() {
    try {
      const response = await axios.get<Conversation[]>('/api/chat/conversations')
      conversations.value = response.data.map(conv => ({
        ...conv,
        lastActivity: new Date(conv.lastActivity),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error)
      throw error
    }
  }

  async function sendMessage(content: string, files: File[] = []) {
    if (!activeConversationId.value) {
      throw new Error('Aucune conversation active')
    }

    try {
      const formData = new FormData()
      formData.append('content', content)
      files.forEach(file => formData.append('files', file))

      const response = await axios.post<ChatResponse>(`/api/chat/messages/${activeConversationId.value}`, formData)
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      throw error
    }
  }

  return {
    // État
    conversations,
    activeConversationId,
    isTyping,
    
    // Getters
    activeConversation,
    
    // Actions
    setActiveConversation,
    createConversation,
    deleteConversation,
    renameConversation,
    addMessage,
    setTyping,
    fetchConversations,
    sendMessage
  }
}) 