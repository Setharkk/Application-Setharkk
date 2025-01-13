import axios from 'axios'

export default {
  namespaced: true,
  
  state: {
    reports: [],
    selectedReport: null,
    loading: false,
    error: null
  },

  mutations: {
    SET_REPORTS(state, reports) {
      state.reports = reports
    },
    SET_SELECTED_REPORT(state, report) {
      state.selectedReport = report
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetchReports({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get('/api/marketing/reports')
        commit('SET_REPORTS', response.data.reports)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des rapports')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createReport({ commit, dispatch }, reportData) {
      try {
        commit('SET_LOADING', true)
        await axios.post('/api/marketing/reports', reportData)
        await dispatch('fetchReports')
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la création du rapport')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateReport({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        await axios.put(`/api/marketing/reports/${id}`, data)
        await dispatch('fetchReports')
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la mise à jour du rapport')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteReport({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`/api/marketing/reports/${id}`)
        await dispatch('fetchReports')
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la suppression du rapport')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async generateReport({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.post(`/api/marketing/reports/${id}/generate`, {}, {
          responseType: 'blob'
        })
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la génération du rapport')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    selectReport({ commit }, report) {
      commit('SET_SELECTED_REPORT', report)
    },

    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  },

  getters: {
    getReports: state => state.reports,
    getSelectedReport: state => state.selectedReport,
    isLoading: state => state.loading,
    getError: state => state.error
  }
} 