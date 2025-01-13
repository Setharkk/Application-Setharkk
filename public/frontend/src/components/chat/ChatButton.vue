<template>
  <div class="chat-button-container">
    <button 
      class="chat-button"
      :class="{ 'active': isOpen }"
      @click="$emit('toggle')"
      :aria-label="isOpen ? 'Fermer le chat' : 'Ouvrir le chat'"
    >
      <i class="fas" :class="isOpen ? 'fa-times' : 'fa-comments'"></i>
      <span class="button-text">{{ isOpen ? 'Fermer' : 'Chat' }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ChatButton',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    console.log('ChatButton mounted'); // Pour le débogage
  }
};
</script>

<style scoped>
.chat-button-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}

.chat-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border-radius: 30px;
  background: #2c3e50;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.chat-button:hover {
  background: #34495e;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.chat-button.active {
  background: #e74c3c;
}

.chat-button.active:hover {
  background: #c0392b;
}

.button-text {
  font-weight: bold;
  font-size: 16px;
}

.fas {
  font-size: 20px;
}

@media (max-width: 480px) {
  .chat-button-container {
    bottom: 20px;
    right: 20px;
  }
  
  .chat-button {
    padding: 12px 20px;
  }
}
</style> 