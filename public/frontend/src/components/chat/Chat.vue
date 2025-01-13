<template>
  <div class="chat-container">
    <Transition name="slide-fade">
      <ChatWindow v-if="isOpen" class="chat-window-container" />
    </Transition>
    <ChatButton :isOpen="isOpen" @toggle="toggleChat" />
  </div>
</template>

<script>
import { ref } from 'vue';
import ChatWindow from './ChatWindow.vue';
import ChatButton from './ChatButton.vue';

export default {
  name: 'Chat',
  components: {
    ChatWindow,
    ChatButton
  },
  setup() {
    const isOpen = ref(false);

    const toggleChat = () => {
      isOpen.value = !isOpen.value;
      console.log('Chat toggled:', isOpen.value);
    };

    return {
      isOpen,
      toggleChat
    };
  }
};
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
}

.chat-window-container {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 400px;
  height: 600px;
  z-index: 9998;
}

@media (max-width: 480px) {
  .chat-window-container {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style> 