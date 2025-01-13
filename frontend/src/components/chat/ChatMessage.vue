<template>
  <div :class="['chat-message', { 'user-message': isUser, 'assistant-message': !isUser }]">
    <div class="message-avatar">
      <img :src="avatarSrc" :alt="isUser ? 'User Avatar' : 'Assistant Avatar'" />
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">{{ isUser ? 'Vous' : 'Assistant' }}</span>
        <span class="message-time">{{ formatTime(timestamp) }}</span>
      </div>
      <div class="message-text" v-html="formattedContent"></div>
      <div v-if="attachments && attachments.length" class="message-attachments">
        <div v-for="attachment in attachments" :key="attachment.id" class="attachment">
          <i class="fas fa-paperclip"></i>
          <span>{{ attachment.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { formatTime, formatMessage } from '@/utils/formatters'

interface Attachment {
  id: string
  name: string
  url: string
}

interface Props {
  content: string
  isUser: boolean
  timestamp: Date
  attachments?: Attachment[]
}

const props = withDefaults(defineProps<Props>(), {
  attachments: () => []
})

const formattedContent = ref('')

const avatarSrc = computed(() => {
  return props.isUser 
    ? '/assets/user-avatar.png'
    : '/assets/assistant-avatar.png'
})

async function updateFormattedContent() {
  formattedContent.value = await formatMessage(props.content)
}

watch(() => props.content, updateFormattedContent)

onMounted(updateFormattedContent)
</script>

<style scoped lang="scss">
.chat-message {
  display: flex;
  margin: 1rem 0;
  gap: 1rem;
  
  &.user-message {
    flex-direction: row-reverse;
    
    .message-content {
      background-color: #e3f2fd;
      border-radius: 15px 15px 0 15px;
    }
  }
  
  &.assistant-message .message-content {
    background-color: #f5f5f5;
    border-radius: 15px 15px 15px 0;
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.message-content {
  padding: 1rem;
  max-width: 70%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  .sender-name {
    font-weight: bold;
  }
  
  .message-time {
    color: #666;
  }
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-attachments {
  margin-top: 0.5rem;
  
  .attachment {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #2196f3;
    font-size: 0.9rem;
    
    i {
      font-size: 1.1rem;
    }
  }
}
</style> 