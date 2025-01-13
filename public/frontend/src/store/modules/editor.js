import axios from 'axios';

export default {
  namespaced: true,
  state: {
    content: '',
    savedContent: null,
    suggestions: []
  },
  mutations: {
    SET_CONTENT(state, content) {
      state.content = content;
    },
    SET_SAVED_CONTENT(state, content) {
      state.savedContent = content;
    },
    SET_SUGGESTIONS(state, suggestions) {
      state.suggestions = suggestions;
    }
  },
  actions: {
    async saveContent({ commit }, content) {
      try {
        const response = await axios.post('/api/editor/save', { content });
        commit('SET_SAVED_CONTENT', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de la sauvegarde du contenu');
      }
    },
    async getSuggestions({ commit }) {
      try {
        const response = await axios.get('/api/editor/suggestions');
        commit('SET_SUGGESTIONS', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }
    }
  },
  getters: {
    hasUnsavedChanges: state => state.content !== state.savedContent
  }
}; 