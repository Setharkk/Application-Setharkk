import api from '@/services/api'
import logger from '@/services/logger'

export default {
  namespaced: true,

  state: {
    integrations: {
      afforai: {
        enabled: false,
        apiKey: null,
        config: {}
      },
      seo: {
        enabled: false,
        config: {}
      }
    },
    loading: false,
    error: null
  },

  mutations: {
    SET_INTEGRATION_STATUS(state, { name, status }) {
      state.integrations[name].enabled = status
    },
    SET_INTEGRATION_CONFIG(state, { name, config }) {
      state.integrations[name].config = { ...config }
    },
    SET_API_KEY(state, { name, key }) {
      state.integrations[name].apiKey = key
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async configureIntegration({ commit }, { name, config }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      try {
        const response = await api.post(`/integrations/${name}/configure`, config)
        commit('SET_INTEGRATION_CONFIG', { name, config: response.data })
        commit('SET_INTEGRATION_STATUS', { name, status: true })
        return response.data
      } catch (error) {
        logger.error(`Erreur de configuration de l'intégration ${name}:`, error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async setApiKey({ commit }, { name, key }) {
      try {
        await api.post(`/integrations/${name}/api-key`, { key })
        commit('SET_API_KEY', { name, key })
        commit('SET_INTEGRATION_STATUS', { name, status: true })
      } catch (error) {
        logger.error(`Erreur lors de la configuration de la clé API pour ${name}:`, error)
        throw error
      }
    },

    async getIntegrationStatus({ commit }, name) {
      try {
        const response = await api.get(`/integrations/${name}/status`)
        commit('SET_INTEGRATION_STATUS', { 
          name, 
          status: response.data.enabled 
        })
        return response.data
      } catch (error) {
        logger.error(`Erreur lors de la vérification du statut de ${name}:`, error)
        throw error
      }
    }
  },

  getters: {
    isIntegrationEnabled: state => name => state.integrations[name]?.enabled || false,
    getIntegrationConfig: state => name => state.integrations[name]?.config || {},
    getApiKey: state => name => state.integrations[name]?.apiKey,
    isLoading: state => state.loading,
    getError: state => state.error
  }
} 