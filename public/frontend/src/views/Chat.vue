<template>
  <div class="chat">
    <div class="conversations-list" v-if="conversations.length">
      <div 
        v-for="conv in conversations" 
        :key="conv.id"
        class="conversation-item"
        :class="{
          active: currentConversation && currentConversation.id === conv.id,
        }"
        @click="selectConversation(conv)"
      >
        {{ conv.title }}
      </div>
      <button class="new-conversation" @click="createNewConversation">
        Nouvelle conversation
      </button>
    </div>
    
    <div class="chat-area">
      <div v-if="!currentConversation" class="empty-state">
        <h2>Bienvenue dans le chat</h2>
        <p>Commencez une nouvelle conversation ou sélectionnez-en une existante.</p>
        <button @click="createNewConversation">Nouvelle conversation</button>
      </div>
      
      <template v-else>
        <div ref="messages" class="messages">
          <div 
            v-for="message in getCurrentMessages" 
            :key="message.id"
            class="message"
            :class="message.role"
          >
            {{ message.content }}
          </div>
        </div>
        
        <div class="message-input">
          <textarea 
            v-model="newMessage"
            placeholder="Écrivez votre message..."
            @keyup.enter.prevent="sendMessage"
          ></textarea>
          <button :disabled="!newMessage.trim()" @click="sendMessage">
            Envoyer
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'ChatView',
  data() {
    return {
      newMessage: ''
    }
  },
  computed: {
    ...mapState('chat', ['conversations', 'currentConversation']),
    ...mapGetters('chat', ['getCurrentMessages'])
  },
  methods: {
    ...mapActions('chat', [
      'fetchConversations',
      'createConversation',
      'sendMessage'
    ]),
    async createNewConversation() {
      const title = `Conversation ${this.conversations.length + 1}`;
      await this.createConversation(title);
    },
    async selectConversation(conversation) {
      await this.$store.commit('chat/setCurrentConversation', conversation);
    },
    async handleSendMessage() {
      if (!this.newMessage.trim() || !this.currentConversation) return;
      await this.sendMessage({
        conversationId: this.currentConversation.id,
        content: this.newMessage.trim()
      });
      
      this.newMessage = '';
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    scrollToBottom() {
      const container = this.$refs.messages;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  },
  async created() {
    await this.fetchConversations();
  },
  updated() {
    this.scrollToBottom();
  }
}
</script>

<style lang="scss">
@use "@/styles/variables" as v;

.chat {
  height: calc(100vh - 100px);
  display: flex;
  gap: v.$spacing-lg;
  padding: v.$spacing-lg;
  
  .conversations-list {
    width: 250px;
    border-right: v.$border-width solid v.$border-color;
    padding-right: v.$spacing-lg;
    
    .conversation-item {
      padding: v.$spacing-sm;
      margin-bottom: v.$spacing-sm;
      border-radius: v.$border-radius;
      cursor: pointer;
      
      &:hover {
        background: v.$background-color;
      }
      
      &.active {
        background: darken(v.$background-color, 5%);
      }
    }
    
    .new-conversation {
      width: 100%;
      padding: 10px;
      background: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:hover {
        background: #3aa876;
      }
    }
  }
  
  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      h2 {
        margin-bottom: 15px;
      }
      
      button {
        margin-top: 20px;
        padding: 10px 20px;
        background: #42b983;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #3aa876;
        }
      }
    }
    
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      
      .message {
        max-width: 70%;
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 4px;
        
        &.user {
          margin-left: auto;
          background: #42b983;
          color: white;
        }
        
        &.assistant {
          margin-right: auto;
          background: #f8f9fa;
        }
      }
    }
    
    .message-input {
      padding: 20px;
      border-top: 1px solid #ddd;
      display: flex;
      gap: 10px;
      
      textarea {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: none;
        height: 40px;
        
        &:focus {
          outline: none;
          border-color: #42b983;
        }
      }
      
      button {
        padding: 0 20px;
        background: #42b983;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        
        &:disabled {
          background: #a8d5c2;
          cursor: not-allowed;
        }
        
        &:hover:not(:disabled) {
          background: #3aa876;
        }
      }
    }
  }
}
</style> 