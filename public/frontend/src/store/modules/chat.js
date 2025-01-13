import axios from 'axios';

export default {
  namespaced: true,
  state: {
    conversations: [],
    currentConversation: null,
    messages: []
  },
  mutations: {
    SET_CONVERSATIONS(state, conversations) {
      state.conversations = conversations;
    },
    SET_CURRENT_CONVERSATION(state, conversation) {
      state.currentConversation = conversation;
    },
    SET_MESSAGES(state, messages) {
      state.messages = messages;
    },
    ADD_MESSAGE(state, message) {
      state.messages.push(message);
    }
  },
  actions: {
    async fetchConversations({ commit }) {
      try {
        const response = await axios.get('/api/chat/conversations');
        commit('SET_CONVERSATIONS', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de la récupération des conversations');
      }
    },
    async createConversation({ commit }, title) {
      try {
        const response = await axios.post('/api/chat/conversation', { title });
        const newConversation = response.data;
        commit('SET_CURRENT_CONVERSATION', newConversation);
        return newConversation;
      } catch (error) {
        throw new Error('Erreur lors de la création de la conversation');
      }
    },
    async sendMessage({ commit }, { conversationId, content }) {
      try {
        const response = await axios.post('/api/chat/message', {
          conversationId,
          content,
          role: 'user'
        });
        commit('ADD_MESSAGE', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
    }
  },
  getters: {
    getCurrentMessages: state => state.messages,
    getConversationById: state => id => {
      return state.conversations.find(conv => conv.id === id);
    }
  }
}; 