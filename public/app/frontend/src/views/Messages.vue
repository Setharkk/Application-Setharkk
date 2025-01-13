<template>
  <div class="messages">
    <!-- Barre latérale avec la liste des conversations -->
    <div class="conversations-sidebar">
      <div class="sidebar-header">
        <h2>Messages</h2>
        <button class="btn-icon" @click="showNewMessageModal = true">
          <i class="fas fa-edit"></i>
        </button>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher une conversation..."
        >
      </div>

      <div class="conversations-list">
        <div 
          v-for="conversation in filteredConversations" 
          :key="conversation.id"
          class="conversation-item"
          :class="{ active: currentConversation?.id === conversation.id }"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-avatar">
            <img 
              v-if="conversation.type === 'individual'"
              :src="conversation.participant.avatar" 
              :alt="conversation.participant.name"
            >
            <div v-else class="group-avatar">
              {{ conversation.name[0] }}
            </div>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <span class="name">
                {{ conversation.type === 'individual' ? conversation.participant.name : conversation.name }}
              </span>
              <span class="time">{{ conversation.lastMessage.time }}</span>
            </div>
            <div class="last-message">
              <span class="preview">{{ conversation.lastMessage.content }}</span>
              <div 
                v-if="conversation.unreadCount" 
                class="unread-badge"
              >
                {{ conversation.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone principale de chat -->
    <div class="chat-area" v-if="currentConversation">
      <div class="chat-header">
        <div class="chat-info">
          <div class="chat-avatar">
            <img 
              v-if="currentConversation.type === 'individual'"
              :src="currentConversation.participant.avatar" 
              :alt="currentConversation.participant.name"
            >
            <div v-else class="group-avatar">
              {{ currentConversation.name[0] }}
            </div>
          </div>
          <div class="chat-details">
            <h3>
              {{ currentConversation.type === 'individual' ? 
                currentConversation.participant.name : currentConversation.name }}
            </h3>
            <span class="status" v-if="currentConversation.type === 'individual'">
              {{ currentConversation.participant.status }}
            </span>
          </div>
        </div>
        <div class="chat-actions">
          <button class="btn-icon">
            <i class="fas fa-phone"></i>
          </button>
          <button class="btn-icon">
            <i class="fas fa-video"></i>
          </button>
          <button class="btn-icon">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="message in currentConversation.messages" 
          :key="message.id"
          class="message"
          :class="{ 
            'outgoing': message.senderId === currentUserId,
            'incoming': message.senderId !== currentUserId
          }"
        >
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>
      </div>

      <div class="message-input">
        <div class="input-actions">
          <button class="btn-icon">
            <i class="fas fa-paperclip"></i>
          </button>
          <button class="btn-icon">
            <i class="fas fa-smile"></i>
          </button>
        </div>
        <input 
          type="text" 
          v-model="newMessage" 
          placeholder="Écrivez votre message..."
          @keyup.enter="sendMessage"
        >
        <button 
          class="btn-send" 
          :disabled="!newMessage.trim()"
          @click="sendMessage"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <!-- Message de sélection d'une conversation -->
    <div v-else class="no-conversation">
      <div class="placeholder">
        <i class="fas fa-comments"></i>
        <p>Sélectionnez une conversation pour commencer à discuter</p>
      </div>
    </div>

    <!-- Modal pour nouveau message -->
    <div v-if="showNewMessageModal" class="modal">
      <div class="modal-content">
        <h2>Nouveau Message</h2>
        <div class="form-group">
          <label>À :</label>
          <div class="recipients-input">
            <div 
              v-for="recipient in selectedRecipients" 
              :key="recipient.id"
              class="recipient-chip"
            >
              <img :src="recipient.avatar" :alt="recipient.name" class="avatar">
              <span>{{ recipient.name }}</span>
              <button @click="removeRecipient(recipient)">×</button>
            </div>
            <input 
              type="text" 
              v-model="recipientSearch"
              placeholder="Rechercher un contact..."
              @focus="showRecipientsList = true"
            >
          </div>
          <div v-if="showRecipientsList" class="recipients-list">
            <div 
              v-for="contact in filteredContacts" 
              :key="contact.id"
              class="contact-item"
              @click="addRecipient(contact)"
            >
              <img :src="contact.avatar" :alt="contact.name" class="avatar">
              <span>{{ contact.name }}</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Message :</label>
          <textarea 
            v-model="newConversationMessage" 
            placeholder="Écrivez votre message..."
            rows="4"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-outline" @click="showNewMessageModal = false">
            Annuler
          </button>
          <button 
            class="btn-primary" 
            :disabled="!selectedRecipients.length || !newConversationMessage.trim()"
            @click="startNewConversation"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

interface User {
  id: number
  name: string
  avatar: string
  status?: string
}

interface Message {
  id: number
  content: string
  time: string
  senderId: number
}

interface Conversation {
  id: number
  type: 'individual' | 'group'
  participant?: User
  name?: string
  lastMessage: {
    content: string
    time: string
  }
  unreadCount: number
  messages: Message[]
}

export default defineComponent({
  name: 'Messages',
  setup() {
    const currentUserId = 1 // À remplacer par l'ID de l'utilisateur connecté
    const searchQuery = ref('')
    const currentConversation = ref<Conversation | null>(null)
    const newMessage = ref('')
    const showNewMessageModal = ref(false)
    const recipientSearch = ref('')
    const showRecipientsList = ref(false)
    const selectedRecipients = ref<User[]>([])
    const newConversationMessage = ref('')

    const conversations = ref<Conversation[]>([
      {
        id: 1,
        type: 'individual',
        participant: {
          id: 2,
          name: 'Alice',
          avatar: '/avatars/alice.jpg',
          status: 'En ligne'
        },
        lastMessage: {
          content: 'D\'accord, je m\'en occupe !',
          time: '10:30'
        },
        unreadCount: 2,
        messages: [
          {
            id: 1,
            content: 'Salut ! Tu peux regarder le dernier commit ?',
            time: '10:15',
            senderId: 1
          },
          {
            id: 2,
            content: 'Bien sûr, je regarde ça tout de suite',
            time: '10:20',
            senderId: 2
          },
          {
            id: 3,
            content: 'D\'accord, je m\'en occupe !',
            time: '10:30',
            senderId: 2
          }
        ]
      },
      {
        id: 2,
        type: 'group',
        name: 'Équipe Frontend',
        lastMessage: {
          content: 'La nouvelle version est déployée',
          time: '09:45'
        },
        unreadCount: 0,
        messages: [
          {
            id: 1,
            content: 'La nouvelle version est déployée',
            time: '09:45',
            senderId: 3
          }
        ]
      }
    ])

    const contacts = ref<User[]>([
      { id: 2, name: 'Alice', avatar: '/avatars/alice.jpg' },
      { id: 3, name: 'Bob', avatar: '/avatars/bob.jpg' },
      { id: 4, name: 'Charlie', avatar: '/avatars/charlie.jpg' }
    ])

    const filteredConversations = computed(() => {
      if (!searchQuery.value) return conversations.value
      
      return conversations.value.filter(conv => {
        const name = conv.type === 'individual' ? 
          conv.participant?.name : 
          conv.name
        return name?.toLowerCase().includes(searchQuery.value.toLowerCase())
      })
    })

    const filteredContacts = computed(() => {
      if (!recipientSearch.value) return contacts.value
      
      return contacts.value.filter(contact =>
        contact.name.toLowerCase().includes(recipientSearch.value.toLowerCase()) &&
        !selectedRecipients.value.some(r => r.id === contact.id)
      )
    })

    const selectConversation = (conversation: Conversation) => {
      currentConversation.value = conversation
    }

    const sendMessage = () => {
      if (!newMessage.value.trim() || !currentConversation.value) return

      const message: Message = {
        id: Date.now(),
        content: newMessage.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: currentUserId
      }

      currentConversation.value.messages.push(message)
      currentConversation.value.lastMessage = {
        content: message.content,
        time: message.time
      }

      newMessage.value = ''
    }

    const addRecipient = (contact: User) => {
      if (!selectedRecipients.value.some(r => r.id === contact.id)) {
        selectedRecipients.value.push(contact)
      }
      recipientSearch.value = ''
      showRecipientsList.value = false
    }

    const removeRecipient = (recipient: User) => {
      selectedRecipients.value = selectedRecipients.value.filter(
        r => r.id !== recipient.id
      )
    }

    const startNewConversation = () => {
      // Logique pour créer une nouvelle conversation
      showNewMessageModal.value = false
      selectedRecipients.value = []
      newConversationMessage.value = ''
    }

    return {
      currentUserId,
      searchQuery,
      currentConversation,
      newMessage,
      showNewMessageModal,
      recipientSearch,
      showRecipientsList,
      selectedRecipients,
      newConversationMessage,
      filteredConversations,
      filteredContacts,
      selectConversation,
      sendMessage,
      addRecipient,
      removeRecipient,
      startNewConversation
    }
  }
})
</script>

<style scoped>
.messages {
  display: flex;
  height: calc(100vh - 64px);
  background: white;
}

.conversations-sidebar {
  width: 320px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.search-box {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.search-box input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.conversation-item:hover {
  background: #f5f5f5;
}

.conversation-item.active {
  background: #e3f2fd;
}

.conversation-avatar {
  margin-right: 15px;
}

.conversation-avatar img,
.group-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.group-avatar {
  background: #2196F3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.name {
  font-weight: bold;
  margin-right: 10px;
}

.time {
  color: #666;
  font-size: 0.8em;
}

.last-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.unread-badge {
  background: #2196F3;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8em;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-info {
  display: flex;
  align-items: center;
}

.chat-avatar {
  margin-right: 15px;
}

.chat-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.chat-details h3 {
  margin: 0;
  margin-bottom: 5px;
}

.status {
  color: #4CAF50;
  font-size: 0.9em;
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 70%;
  display: flex;
}

.message.outgoing {
  margin-left: auto;
}

.message-content {
  padding: 10px 15px;
  border-radius: 8px;
  position: relative;
}

.message.outgoing .message-content {
  background: #e3f2fd;
}

.message.incoming .message-content {
  background: #f5f5f5;
}

.message-text {
  margin-bottom: 5px;
}

.message-time {
  font-size: 0.8em;
  color: #666;
  text-align: right;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-actions {
  display: flex;
  gap: 5px;
}

.message-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.btn-icon:hover {
  background: #f5f5f5;
}

.btn-send {
  width: 36px;
  height: 36px;
  border: none;
  background: #2196F3;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-send:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.no-conversation {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #666;
}

.placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.recipients-input {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.recipient-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 16px;
}

.recipient-chip .avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.recipient-chip button {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  padding: 0 2px;
}

.recipients-list {
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
}

.contact-item:hover {
  background: #f5f5f5;
}

.contact-item .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 