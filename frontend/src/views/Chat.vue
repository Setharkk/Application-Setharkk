<template>
  <div class="chat">
    <h2>Chat Intelligent</h2>
    <div class="chat-container">
      <ChatInterface
        :messages="messages"
        :is-processing="isProcessing"
        @send-message="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChatInterface from '@/components/chat/ChatInterface.vue'
import axios from 'axios'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface ChatResponse {
  message: string
  timestamp: string
}

const messages = ref<Message[]>([
  {
    id: '1',
    content: 'Bienvenue ! Comment puis-je vous aider aujourd\'hui ?',
    sender: 'assistant',
    timestamp: new Date()
  }
])

const isProcessing = ref(false)

const handleSendMessage = async (content: string) => {
  console.log('Envoi du message:', content)
  try {
    isProcessing.value = true
    
    // Ajouter le message de l'utilisateur
    messages.value.push({
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    })

    console.log('URL de l\'API:', `${import.meta.env.VITE_API_URL}/api/chat`)
    
    // Envoyer le message au backend
    const response = await axios.post<ChatResponse>(`${import.meta.env.VITE_API_URL}/api/chat`, {
      message: content
    })

    console.log('Réponse du backend:', response.data)

    // Ajouter la réponse du backend
    messages.value.push({
      id: Date.now().toString(),
      content: response.data.message,
      sender: 'assistant',
      timestamp: new Date(response.data.timestamp)
    })
  } catch (error) {
    console.error('Erreur détaillée:', error)
    messages.value.push({
      id: Date.now().toString(),
      content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
      sender: 'assistant',
      timestamp: new Date()
    })
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.chat {
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style> 