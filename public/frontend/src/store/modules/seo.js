import axios from 'axios';

export default {
  namespaced: true,
  state: {
    analysis: null,
    keywords: [],
    optimizationSuggestions: []
  },
  mutations: {
    SET_ANALYSIS(state, analysis) {
      state.analysis = analysis;
    },
    SET_KEYWORDS(state, keywords) {
      state.keywords = keywords;
    },
    SET_OPTIMIZATION_SUGGESTIONS(state, suggestions) {
      state.optimizationSuggestions = suggestions;
    }
  },
  actions: {
    async analyzePage({ commit }, content) {
      try {
        const response = await axios.post('/api/seo/analyze', { content });
        commit('SET_ANALYSIS', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de l\'analyse SEO');
      }
    },
    async checkKeywords({ commit }, content) {
      try {
        const response = await axios.post('/api/seo/keywords/check', { content });
        commit('SET_KEYWORDS', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de la vérification des mots-clés');
      }
    },
    async getOptimizationSuggestions({ commit }, content) {
      try {
        const response = await axios.post('/api/seo/optimize', { content });
        commit('SET_OPTIMIZATION_SUGGESTIONS', response.data);
        return response.data;
      } catch (error) {
        throw new Error('Erreur lors de la récupération des suggestions d\'optimisation');
      }
    }
  },
  getters: {
    hasAnalysis: state => !!state.analysis,
    getScore: state => state.analysis ? state.analysis.score : 0
  }
}; 