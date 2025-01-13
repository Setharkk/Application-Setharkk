<template>
  <div class="seo-ai-container">
    <div class="seo-ai-content">
      <div class="chat-section">
        <ChatWindow />
      </div>
      <div class="suggestions-section">
        <Suggestions :pageUrl="currentUrl" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import ChatWindow from './ChatWindow.vue';
import Suggestions from './Suggestions.vue';

export default {
  name: 'SEOAI',
  components: {
    ChatWindow,
    Suggestions
  },
  setup() {
    const currentUrl = ref('');

    onMounted(() => {
      currentUrl.value = window.location.href;
    });

    return {
      currentUrl
    };
  }
};
</script>

<style scoped>
.seo-ai-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.seo-ai-content {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
}

.chat-section {
  flex: 1;
  min-width: 0;
}

.suggestions-section {
  width: 400px;
  min-width: 400px;
}

@media (max-width: 1024px) {
  .seo-ai-content {
    flex-direction: column;
  }

  .suggestions-section {
    width: 100%;
    min-width: 0;
  }
}
</style> 