<template>
  <div class="app">
    <GlobalStyle />
    <!-- Navigation latérale -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h1>Setharkk</h1>
      </div>

      <div class="nav-buttons">
        <button 
          v-for="route in routes" 
          :key="route.path"
          class="nav-btn" 
          :class="{ active: activeModule === route.name }"
          @click="navigateTo(route.name)"
        >
          <i :class="route.icon"></i>
          <span>{{ route.label }}</span>
        </button>
      </div>

      <div class="user-info">
        <img :src="userAvatar" alt="Profile" class="avatar" />
        <div class="user-details">
          <span class="username">{{ username }}</span>
          <span class="status">{{ userStatus }}</span>
        </div>
      </div>
    </nav>

    <!-- Zone principale -->
    <main class="main-content">
      <!-- En-tête -->
      <header class="main-header">
        <div class="module-title">
          <h2>{{ currentModuleTitle }}</h2>
        </div>
        <div class="header-actions">
          <button 
            v-for="action in currentModuleActions" 
            :key="action.id"
            class="action-btn"
            @click="action.handler"
          >
            <i :class="action.icon"></i>
            {{ action.label }}
          </button>
        </div>
      </header>

      <!-- Zone de chat centrale -->
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessages">
          <TransitionGroup name="message">
            <div 
              v-for="message in messages" 
              :key="message.id"
              class="message" 
              :class="message.type"
            >
              <div class="message-avatar">
                <img :src="message.avatar" :alt="message.sender" />
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender">{{ message.sender }}</span>
                  <span class="time">{{ formatTime(message.time) }}</span>
                </div>
                <div class="message-text" v-html="message.content"></div>
                <div class="message-actions" v-if="message.actions?.length">
                  <button 
                    v-for="action in message.actions" 
                    :key="action.id"
                    class="message-action-btn"
                    @click="handleMessageAction(message, action)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Zone de saisie -->
        <div class="chat-input">
          <div class="input-container">
            <textarea 
              v-model="newMessage" 
              @keyup.enter.exact.prevent="sendMessage"
              @keydown.tab.prevent="handleTabCompletion"
              placeholder="Posez votre question ou décrivez votre besoin..."
              rows="1"
              ref="messageInput"
              :disabled="isProcessing"
            ></textarea>
            <div class="input-actions">
              <button 
                class="upload-btn" 
                @click="uploadFile"
                :disabled="isProcessing"
              >
                <i class="fas fa-paperclip"></i>
              </button>
              <button 
                class="send-btn" 
                @click="sendMessage"
                :disabled="!canSendMessage"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div class="quick-actions">
            <button 
              v-for="action in quickActions" 
              :key="action.id"
              class="quick-action-btn"
              @click="executeQuickAction(action)"
              :disabled="isProcessing"
            >
              <i :class="action.icon"></i>
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Panneau contextuel -->
    <Transition name="slide">
      <aside class="context-panel" v-if="showContextPanel">
        <div class="panel-header">
          <h3>{{ contextPanelTitle }}</h3>
          <button class="close-btn" @click="closeContextPanel">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="panel-content">
          <component 
            :is="contextPanelComponent" 
            v-bind="contextPanelProps"
            @close="closeContextPanel"
          />
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute, type RouteRecordName } from 'vue-router'
import { GlobalStyle } from '@/globalStyle'
import { formatTime } from './utils/date'
import type { Action, Message, Route } from '@/types'

// Router
const router = useRouter()
const route = useRoute()

// État
const activeModule = ref<RouteRecordName>(route.name || 'dashboard')
const messages = ref<Message[]>([])
const newMessage = ref('')
const isProcessing = ref(false)
const showContextPanel = ref(false)
const contextPanelTitle = ref('')
const contextPanelComponent = ref(null)
const contextPanelProps = ref({})
const username = ref('John Doe')
const userAvatar = ref('/avatars/default.png')
const userStatus = ref('En ligne')

// Routes disponibles
const routes: Route[] = [
  { name: 'dashboard', path: '/', label: 'Tableau de bord', icon: 'fas fa-home' },
  { name: 'seo', path: '/seo', label: 'Analyse SEO', icon: 'fas fa-search' },
  { name: 'memory', path: '/memory', label: 'Mémoire', icon: 'fas fa-brain' },
  { name: 'analytics', path: '/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
  { name: 'reports', path: '/reports', label: 'Rapports', icon: 'fas fa-file-alt' },
  { name: 'settings', path: '/settings', label: 'Paramètres', icon: 'fas fa-cog' }
]

// Actions rapides
const quickActions: Action[] = [
  { id: 'analyze', label: 'Analyser URL', icon: 'fas fa-search' },
  { id: 'report', label: 'Générer rapport', icon: 'fas fa-file-alt' },
  { id: 'optimize', label: 'Optimiser', icon: 'fas fa-magic' }
]

// Computed
const currentModuleTitle = computed(() => {
  const route = routes.find(r => r.name === activeModule.value)
  return route?.label || 'Accueil'
})

const currentModuleActions = computed(() => {
  const actions: Action[] = []
  if (activeModule.value === 'seo') {
    actions.push({
      id: 'new-analysis',
      label: 'Nouvelle analyse',
      icon: 'fas fa-plus',
      handler: startNewAnalysis
    })
  }
  if (['seo', 'reports'].includes(String(activeModule.value))) {
    actions.push({
      id: 'export',
      label: 'Exporter',
      icon: 'fas fa-download',
      handler: exportData
    })
  }
  return actions
})

const canSendMessage = computed(() => {
  return !isProcessing.value && newMessage.value.trim().length > 0
})

// Méthodes
const navigateTo = (name: string | symbol) => {
  activeModule.value = name as string
  router.push({ name })
}

const sendMessage = async () => {
  if (!canSendMessage.value) return

  const userMessage: Message = {
    id: Date.now(),
    type: 'user',
    sender: username.value,
    avatar: userAvatar.value,
    content: newMessage.value,
    time: new Date().toISOString()
  }
  messages.value.push(userMessage)
  newMessage.value = ''
  
  await nextTick()
  scrollToBottom()

  // Simuler le traitement
  isProcessing.value = true
  setTimeout(() => {
    const assistantMessage: Message = {
      id: Date.now(),
      type: 'assistant',
      sender: 'Assistant',
      avatar: '/avatars/assistant.png',
      content: 'Je traite votre demande...',
      time: new Date().toISOString(),
      actions: [
        { id: 'details', label: 'Voir les détails' },
        { id: 'optimize', label: 'Optimiser' }
      ]
    }
    messages.value.push(assistantMessage)
    scrollToBottom()
    isProcessing.value = false
  }, 1000)
}

const scrollToBottom = () => {
  const container = document.querySelector('.chat-messages')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

const handleMessageAction = (message: Message, action: Action) => {
  console.log('Message action:', { message, action })
}

const executeQuickAction = (action: Action) => {
  console.log('Quick action:', action)
}

const uploadFile = () => {
  // Implémenter l'upload de fichiers
}

const startNewAnalysis = () => {
  // Implémenter nouvelle analyse
}

const exportData = () => {
  // Implémenter export
}

const handleTabCompletion = () => {
  // Implémenter l'autocomplétion
}

const closeContextPanel = () => {
  showContextPanel.value = false
  contextPanelComponent.value = null
  contextPanelProps.value = {}
}

// Surveillance de la route
watch(
  () => route.name,
  (newName) => {
    if (newName) {
      activeModule.value = newName
    }
  }
)

// Initialisation
onMounted(() => {
  messages.value.push({
    id: Date.now(),
    type: 'assistant',
    sender: 'Assistant',
    avatar: '/avatars/assistant.png',
    content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
    time: new Date().toISOString()
  })
})
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background-color: var(--background-color);
}

.sidebar {
  width: 280px;
  background: var(--secondary-color);
  color: #a0aec0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo {
  width: 40px;
  height: 40px;
}

.nav-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #a0aec0;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-btn.active {
  background: var(--primary-color);
  color: #fff;
}

.nav-btn i {
  width: 20px;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-top: auto;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  color: #fff;
  font-weight: 500;
}

.status {
  color: var(--success-color);
  font-size: 0.875rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: var(--primary-color);
  color: #fff;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: darken(var(--primary-color), 10%);
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1.5rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message {
  display: flex;
  gap: 1rem;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.message-content {
  background: #fff;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background: var(--primary-color);
  color: #fff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.message.user .message-header {
  color: rgba(255, 255, 255, 0.9);
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.message-action-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  background: #edf2f7;
  color: var(--text-color);
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.message-action-btn:hover {
  background: #e2e8f0;
}

.chat-input {
  margin-top: 1.5rem;
}

.input-container {
  display: flex;
  gap: 1rem;
  background: #fff;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
}

textarea:disabled {
  background: none;
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.upload-btn, .send-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.send-btn {
  color: var(--primary-color);
}

.upload-btn:hover, .send-btn:hover {
  background: #edf2f7;
}

.upload-btn:disabled, .send-btn:disabled {
  color: #a0aec0;
  cursor: not-allowed;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: #fff;
  color: var(--text-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.quick-action-btn:hover {
  background: #edf2f7;
}

.quick-action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.context-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #edf2f7;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Animations */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style> 