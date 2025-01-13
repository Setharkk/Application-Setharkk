<template>
  <header class="chat-header">
    <div class="assistant-info">
      <div class="assistant-avatar">
        <img :src="assistantAvatar" alt="Assistant Avatar" />
        <span class="status-indicator" :class="{ online: isOnline }"></span>
      </div>
      
      <div class="assistant-details">
        <h2 class="assistant-name">{{ assistantName }}</h2>
        <p class="assistant-status">{{ statusText }}</p>
      </div>
    </div>
    
    <div class="header-actions">
      <button 
        class="action-button"
        @click="$emit('toggle-sidebar')"
        title="Toggle Sidebar"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <button 
        class="action-button"
        @click="$emit('clear-chat')"
        title="Clear Chat"
      >
        <i class="fas fa-trash"></i>
      </button>
      
      <button 
        class="action-button"
        @click="$emit('toggle-settings')"
        title="Settings"
      >
        <i class="fas fa-cog"></i>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  assistantName: string
  assistantAvatar: string
  isOnline?: boolean
  status?: 'idle' | 'typing' | 'processing'
}

const props = withDefaults(defineProps<Props>(), {
  isOnline: true,
  status: 'idle'
})

const statusText = computed(() => {
  switch (props.status) {
    case 'typing':
      return 'En train d\'écrire...'
    case 'processing':
      return 'En train de réfléchir...'
    default:
      return props.isOnline ? 'En ligne' : 'Hors ligne'
  }
})

defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'clear-chat'): void
  (e: 'toggle-settings'): void
}>()
</script>

<style scoped lang="scss">
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.assistant-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #bdbdbd;
    border: 2px solid white;
    
    &.online {
      background-color: #4caf50;
    }
  }
}

.assistant-details {
  .assistant-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .assistant-status {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
  }
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  
  .action-button {
    padding: 0.5rem;
    border: none;
    border-radius: 8px;
    background-color: transparent;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f5f5f5;
      color: #2196f3;
    }
    
    i {
      font-size: 1.2rem;
    }
  }
}
</style> 