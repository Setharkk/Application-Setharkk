<template>
  <div class="chat-window">
    <div class="chat-header">
      <h3>Assistant SEO IA</h3>
      <span class="status" :class="{ active: isConnected }">
        {{ isConnected ? 'Connecté' : 'Déconnecté' }}
      </span>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index"
        :class="['message', message.type]">
        <div class="message-content">{{ message.content }}</div>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>

    <div class="chat-input">
      <textarea
        v-model="userInput"
        @keyup.enter.prevent="sendMessage"
        placeholder="Posez votre question SEO..."
        :disabled="!isConnected"
      ></textarea>
      <button @click="sendMessage" :disabled="!isConnected || !userInput.trim()">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useAIController } from './AIController';

export default {
  name: 'ChatWindow',
  setup() {
    const messages = ref([]);
    const userInput = ref('');
    const isConnected = ref(true);
    const messagesContainer = ref(null);
    const aiController = useAIController();

    const sendMessage = async () => {
      if (!userInput.value.trim() || !isConnected.value) return;

      const message = {
        content: userInput.value,
        type: 'user',
        timestamp: new Date()
      };

      messages.value.push(message);
      userInput.value = '';

      try {
        const response = await aiController.sendMessage(
          message.content,
          messages.value.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        );

        messages.value.push({
          content: response.message,
          type: 'ai',
          timestamp: new Date(response.timestamp)
        });
      } catch (error) {
        messages.value.push({
          content: "Désolé, une erreur est survenue. Veuillez réessayer.",
          type: 'system',
          timestamp: new Date()
        });
      }
    };

    const formatTime = (timestamp) => {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp);
    };

    watch(messages, () => {
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      }, 100);
    });

    return {
      messages,
      userInput,
      isConnected,
      messagesContainer,
      sendMessage,
      formatTime
    };
  }
};
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.chat-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.status {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background: #ef4444;
  color: white;
}

.status.active {
  background: #22c55e;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  max-width: 80%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background: #3b82f6;
  color: white;
}

.message.ai {
  align-self: flex-start;
  background: #f3f4f6;
  color: #111827;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  position: absolute;
  bottom: -1.25rem;
  right: 0.5rem;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.chat-input textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  resize: none;
  height: 2.5rem;
  line-height: 1.5;
}

.chat-input button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-input button:hover:not(:disabled) {
  background: #2563eb;
}

.chat-input button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
