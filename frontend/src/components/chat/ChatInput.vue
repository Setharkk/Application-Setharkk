<template>
  <div class="chat-input">
    <div class="input-container">
      <textarea
        v-model="messageText"
        @keydown.enter.prevent="handleEnter"
        placeholder="Tapez votre message ici..."
        :rows="textareaRows"
        ref="textarea"
      ></textarea>
      
      <div class="actions">
        <button 
          class="attach-button"
          @click="triggerFileInput"
          title="Joindre un fichier"
        >
          <i class="fas fa-paperclip"></i>
        </button>
        
        <button 
          class="send-button"
          @click="sendMessage"
          :disabled="!canSend"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
    
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      multiple
      class="hidden"
    />
    
    <div v-if="attachments.length" class="attachments-preview">
      <div v-for="(file, index) in attachments" :key="index" class="attachment">
        <span class="filename">{{ file.name }}</span>
        <button @click="removeAttachment(index)" class="remove-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'send', message: string, files: File[]): void
}>()

const messageText = ref('')
const attachments = ref<File[]>([])
const textarea = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()

const textareaRows = computed(() => {
  const lines = messageText.value.split('\n').length
  return Math.min(Math.max(1, lines), 5)
})

const canSend = computed(() => {
  return messageText.value.trim().length > 0 || attachments.value.length > 0
})

function handleEnter(e: KeyboardEvent) {
  if (e.shiftKey) return
  sendMessage()
}

function sendMessage() {
  if (!canSend.value) return
  
  emit('send', messageText.value, attachments.value)
  messageText.value = ''
  attachments.value = []
  
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    attachments.value.push(...Array.from(input.files))
  }
  input.value = ''
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.chat-input {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

.input-container {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  
  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    resize: none;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    
    &:focus {
      outline: none;
      border-color: #2196f3;
    }
  }
}

.actions {
  display: flex;
  gap: 0.5rem;
  
  button {
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    i {
      font-size: 1.2rem;
    }
  }
  
  .send-button {
    color: #2196f3;
  }
}

.hidden {
  display: none;
}

.attachments-preview {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .attachment {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    font-size: 0.9rem;
    
    .filename {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .remove-button {
      padding: 0.25rem;
      border: none;
      background: none;
      color: #666;
      cursor: pointer;
      
      &:hover {
        color: #f44336;
      }
    }
  }
}
</style> 