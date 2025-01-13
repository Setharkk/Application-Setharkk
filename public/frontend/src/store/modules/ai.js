import { SeoService } from '@/services/seo'
import logger from '@/services/logger'

export default {
  namespaced: true,

  state: {
    analysis: null,
    suggestions: [],
    isAnalyzing: false,
    error: null
  },

  mutations: {
    SET_ANALYSIS(state, analysis) {
      state.analysis = analysis
    },
    SET_SUGGESTIONS(state, suggestions) {
      state.suggestions = suggestions
    },
    SET_ANALYZING(state, status) {
      state.isAnalyzing = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async analyzeContent({ commit }, content) {
      commit('SET_ANALYZING', true)
      commit('SET_ERROR', null)
      
      try {
        const analysis = await SeoService.analyze(content)
        commit('SET_ANALYSIS', analysis)
        return analysis
      } catch (error) {
        logger.error('Erreur lors de l\'analyse AI:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_ANALYZING', false)
      }
    },

    async getSuggestions({ commit }, url) {
      try {
        const suggestions = await SeoService.getSuggestions(url)
        commit('SET_SUGGESTIONS', suggestions)
        return suggestions
      } catch (error) {
        logger.error('Erreur lors de la récupération des suggestions:', error)
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    clearAnalysis({ commit }) {
      commit('SET_ANALYSIS', null)
      commit('SET_SUGGESTIONS', [])
      commit('SET_ERROR', null)
    }
  },

  getters: {
    hasAnalysis: state => !!state.analysis,
    getAnalysis: state => state.analysis,
    getSuggestions: state => state.suggestions,
    isAnalyzing: state => state.isAnalyzing,
    getError: state => state.error
  }
}
