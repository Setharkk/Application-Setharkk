import axios from 'axios'

export default {
  namespaced: true,

  state: {
    metrics: {
      visitors: 0,
      conversions: 0,
      revenue: 0,
      roi: 0
    },
    trends: [],
    campaigns: [],
    loading: false,
    error: null,
    timeframe: '7d'
  },

  mutations: {
    SET_METRICS(state, metrics) {
      state.metrics = metrics
    },
    SET_TRENDS(state, trends) {
      state.trends = trends
    },
    SET_CAMPAIGNS(state, campaigns) {
      state.campaigns = campaigns
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_TIMEFRAME(state, timeframe) {
      state.timeframe = timeframe
    }
  },

  actions: {
    async fetchMetrics({ commit, state }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`/api/marketing/analytics/metrics?timeframe=${state.timeframe}`)
        commit('SET_METRICS', response.data.metrics)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des métriques')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchTrends({ commit, state }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get(`/api/marketing/analytics/trends?timeframe=${state.timeframe}`)
        commit('SET_TRENDS', response.data.trends)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des tendances')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchCampaigns({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get('/api/marketing/analytics/campaigns')
        commit('SET_CAMPAIGNS', response.data.campaigns)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des campagnes')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    setTimeframe({ commit, dispatch }, timeframe) {
      commit('SET_TIMEFRAME', timeframe)
      dispatch('fetchMetrics')
      dispatch('fetchTrends')
    },

    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  },

  getters: {
    getMetrics: state => state.metrics,
    getTrends: state => state.trends,
    getCampaigns: state => state.campaigns,
    isLoading: state => state.loading,
    getError: state => state.error,
    getTimeframe: state => state.timeframe
  }
} 