<template>
  <div class="chat-interface">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" :class="['message', message.sender]">
        <div class="message-content">
          <p>{{ message.content }}</p>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <textarea
        v-model="newMessage"
        @keydown="handleKeyDown"
        placeholder="Tapez votre message ici..."
        :disabled="isProcessing || isSubmitting"
      ></textarea>
      <button 
        @click="sendMessage" 
        :disabled="isProcessing || isSubmitting || !newMessage.trim()"
        class="send-button"
      >
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { formatTime } from '@/utils/date'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

const props = defineProps<{
  isProcessing: boolean
  messages: Message[]
}>()

const emit = defineEmits<{
  'send-message': [message: string]
}>()

const messagesContainer = ref<HTMLElement | null>(null)
const newMessage = ref('')
const isSubmitting = ref(false)

const sendMessage = async () => {
  const message = newMessage.value.trim()
  if (message && !props.isProcessing && !isSubmitting.value) {
    try {
      isSubmitting.value = true
      await emit('send-message', message)
      newMessage.value = ''
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      isSubmitting.value = false
    }
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => props.messages, scrollToBottom, { deep: true })

onMounted(scrollToBottom)
</script>

<style scoped lang="scss">
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1rem;

  &.user {
    justify-content: flex-end;
    
    .message-content {
      background-color: #3498db;
      color: #fff;
      border-radius: 1rem 1rem 0 1rem;
    }
  }

  &.assistant {
    justify-content: flex-start;

    .message-content {
      background-color: #f0f2f5;
      color: #2c3e50;
      border-radius: 1rem 1rem 1rem 0;
    }
  }
}

.message-content {
  max-width: 70%;
  padding: 1rem;
  
  p {
    margin: 0;
    line-height: 1.5;
    word-wrap: break-word;
  }
}

.message-time {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

.chat-input {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;

  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    resize: none;
    height: 45px;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    
    &:focus {
      outline: none;
      border-color: #3498db;
    }

    &:disabled {
      background-color: #f8f9fa;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .send-button {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0.5rem;
    background-color: #3498db;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background-color: #2980b9;
    }

    &:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }

    i {
      font-size: 1.2rem;
    }
  }
}
</style> 