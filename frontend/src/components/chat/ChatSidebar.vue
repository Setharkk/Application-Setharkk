<template>
  <aside class="chat-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <h2>Conversations</h2>
      <button class="new-chat-button" @click="$emit('new-chat')">
        <i class="fas fa-plus"></i>
        Nouvelle conversation
      </button>
    </div>
    
    <div class="conversations-list">
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        class="conversation-item"
        :class="{ active: conversation.id === activeConversationId }"
        @click="$emit('select-conversation', conversation.id)"
      >
        <div class="conversation-info">
          <span class="conversation-title">{{ conversation.title }}</span>
          <span class="conversation-date">{{ formatDate(conversation.lastMessage) }}</span>
        </div>
        
        <div class="conversation-preview">
          {{ conversation.preview }}
        </div>
        
        <div class="conversation-actions">
          <button 
            class="action-button"
            @click.stop="$emit('rename-conversation', conversation.id)"
            title="Rename"
          >
            <i class="fas fa-edit"></i>
          </button>
          
          <button 
            class="action-button"
            @click.stop="$emit('delete-conversation', conversation.id)"
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="user-info">
        <img :src="userAvatar" :alt="userName" class="user-avatar" />
        <span class="user-name">{{ userName }}</span>
      </div>
      
      <button 
        class="logout-button"
        @click="$emit('logout')"
        title="Logout"
      >
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatters'

interface Conversation {
  id: string
  title: string
  preview: string
  lastMessage: Date
}

interface Props {
  isOpen: boolean
  conversations: Conversation[]
  activeConversationId?: string
  userName: string
  userAvatar: string
}

defineProps<Props>()

defineEmits<{
  (e: 'new-chat'): void
  (e: 'select-conversation', id: string): void
  (e: 'rename-conversation', id: string): void
  (e: 'delete-conversation', id: string): void
  (e: 'logout'): void
}>()
</script>

<style scoped lang="scss">
.chat-sidebar {
  width: 300px;
  height: 100%;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    position: absolute;
    left: 0;
    transform: translateX(-100%);
    
    &.is-open {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  
  h2 {
    margin: 0 0 1rem;
    font-size: 1.2rem;
  }
}

.new-chat-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background-color: #2196f3;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976d2;
  }
  
  i {
    font-size: 1rem;
  }
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.conversation-item {
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &.active {
    background-color: #e3f2fd;
  }
  
  .conversation-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
    
    .conversation-title {
      font-weight: 500;
    }
    
    .conversation-date {
      font-size: 0.8rem;
      color: #666;
    }
  }
  
  .conversation-preview {
    font-size: 0.9rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .conversation-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s;
    
    .action-button {
      padding: 0.25rem;
      border: none;
      background: none;
      color: #666;
      cursor: pointer;
      
      &:hover {
        color: #2196f3;
      }
    }
  }
  
  &:hover .conversation-actions {
    opacity: 1;
  }
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .user-name {
      font-weight: 500;
    }
  }
  
  .logout-button {
    padding: 0.5rem;
    border: none;
    background: none;
    color: #666;
    cursor: pointer;
    
    &:hover {
      color: #f44336;
    }
    
    i {
      font-size: 1.2rem;
    }
  }
}
</style> 