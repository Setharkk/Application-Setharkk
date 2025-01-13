import axios from 'axios'

export default {
  namespaced: true,

  state: {
    workflows: [],
    triggers: [],
    actions: [],
    selectedWorkflow: null,
    loading: false,
    error: null
  },

  mutations: {
    SET_WORKFLOWS(state, workflows) {
      state.workflows = workflows
    },
    SET_TRIGGERS(state, triggers) {
      state.triggers = triggers
    },
    SET_ACTIONS(state, actions) {
      state.actions = actions
    },
    SET_SELECTED_WORKFLOW(state, workflow) {
      state.selectedWorkflow = workflow
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetchWorkflows({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get('/api/marketing/automation/workflows')
        commit('SET_WORKFLOWS', response.data.workflows)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des workflows')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchTriggers({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get('/api/marketing/automation/triggers')
        commit('SET_TRIGGERS', response.data.triggers)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des déclencheurs')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchActions({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await axios.get('/api/marketing/automation/actions')
        commit('SET_ACTIONS', response.data.actions)
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors du chargement des actions')
        console.error('Erreur:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createWorkflow({ commit, dispatch }, workflow) {
      try {
        commit('SET_LOADING', true)
        await axios.post('/api/marketing/automation/workflows', workflow)
        await dispatch('fetchWorkflows')
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la création du workflow')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateWorkflow({ commit, dispatch }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        await axios.put(`/api/marketing/automation/workflows/${id}`, data)
        await dispatch('fetchWorkflows')
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la mise à jour du workflow')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteWorkflow({ commit, dispatch }, id) {
      try {
        commit('SET_LOADING', true)
        await axios.delete(`/api/marketing/automation/workflows/${id}`)
        await dispatch('fetchWorkflows')
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la suppression du workflow')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    selectWorkflow({ commit }, workflow) {
      commit('SET_SELECTED_WORKFLOW', workflow)
    },

    clearError({ commit }) {
      commit('SET_ERROR', null)
    }
  },

  getters: {
    getWorkflows: state => state.workflows,
    getTriggers: state => state.triggers,
    getActions: state => state.actions,
    getSelectedWorkflow: state => state.selectedWorkflow,
    isLoading: state => state.loading,
    getError: state => state.error
  }
} 