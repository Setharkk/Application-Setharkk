<template>
  <div class="chat-container">
    <ChatActions
      class="chat-sidebar"
      :is-processing="isProcessing"
      :stats="stats"
      @execute-action="handleAction"
    />
    
    <ChatInterface
      class="chat-main"
      :messages="messages"
      :is-processing="isProcessing"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChatActions from './ChatActions.vue'
import ChatInterface from './ChatInterface.vue'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

const isProcessing = ref(false)
const messages = ref<Message[]>([])
const stats = ref({
  activeTasks: 0,
  analyses: 0,
  systemStatus: {
    cpu: 0,
    memory: 0,
    latency: 0,
    uptime: '0:00:00'
  },
  marketingStats: {
    linkedinConnections: 0,
    seoRank: 0,
    campaignClicks: 0,
    leadsGenerated: 0
  }
})

async function handleAction(action: string) {
  isProcessing.value = true
  try {
    // Simuler une réponse de l'assistant
    messages.value.push({
      id: Date.now().toString(),
      content: `Action ${action} en cours d'exécution...`,
      sender: 'assistant',
      timestamp: new Date()
    })
    
    // Mettre à jour les stats (à remplacer par la vraie logique)
    stats.value.activeTasks++
    
    // Attendre la réponse (à remplacer par la vraie logique)
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error)
  } finally {
    isProcessing.value = false
  }
}

async function handleSendMessage(message: string) {
  if (!message.trim()) return
  
  // Ajouter le message de l'utilisateur
  messages.value.push({
    id: Date.now().toString(),
    content: message,
    sender: 'user',
    timestamp: new Date()
  })
  
  isProcessing.value = true
  try {
    // Simuler une réponse de l'assistant (à remplacer par la vraie logique)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    messages.value.push({
      id: Date.now().toString(),
      content: `Je traite votre demande : "${message}"`,
      sender: 'assistant',
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
  } finally {
    isProcessing.value = false
  }
}

// Fonction pour mettre à jour les métriques système
function updateSystemMetrics() {
  // Simuler la récupération des métriques (à remplacer par de vraies données)
  stats.value.systemStatus = {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    latency: Math.floor(Math.random() * 200),
    uptime: '2:45:30'
  }
}

// Fonction pour mettre à jour les métriques marketing
function updateMarketingMetrics() {
  stats.value.marketingStats = {
    linkedinConnections: Math.floor(Math.random() * 100),
    seoRank: Math.floor(Math.random() * 100),
    campaignClicks: Math.floor(Math.random() * 1000),
    leadsGenerated: Math.floor(Math.random() * 50)
  }
}

// Mettre à jour les métriques toutes les 5 secondes
onMounted(() => {
  updateSystemMetrics()
  updateMarketingMetrics()
  setInterval(() => {
    updateSystemMetrics()
    updateMarketingMetrics()
  }, 5000)
})
</script>

<style scoped lang="scss">
.chat-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
  background-color: #f8f9fa;
}

.chat-sidebar {
  border-right: 1px solid #e0e0e0;
}

.chat-main {
  background-color: #fff;
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
  }
  
  .chat-sidebar {
    display: none;
  }
}
</style> 