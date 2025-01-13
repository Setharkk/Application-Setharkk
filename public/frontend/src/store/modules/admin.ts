import { Module } from 'vuex'
import { RootState } from '../types'
import axios from 'axios'

interface AdminState {
  services: any[]
  systemResources: {
    cpu: number
    cpuDetails: string
    memory: {
      used: number
      total: number
      percentage: number
    }
    disk: {
      used: number
      total: number
      percentage: number
    }
  }
  systemLogs: any[]
  performanceData: {
    cpu: any[]
    memory: any[]
    disk: any[]
  }
  error: string | null
}

const admin: Module<AdminState, RootState> = {
  namespaced: true,

  state: {
    services: [],
    systemResources: {
      cpu: 0,
      cpuDetails: '',
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      disk: {
        used: 0,
        total: 0,
        percentage: 0
      }
    },
    systemLogs: [],
    performanceData: {
      cpu: [],
      memory: [],
      disk: []
    },
    error: null
  },

  getters: {
    getServices: state => state.services,
    getSystemResources: state => state.systemResources,
    getSystemLogs: state => state.systemLogs,
    getPerformanceData: state => state.performanceData,
    getError: state => state.error
  },

  mutations: {
    SET_SERVICES(state, services) {
      state.services = services
    },
    SET_SYSTEM_RESOURCES(state, resources) {
      state.systemResources = resources
    },
    SET_SYSTEM_LOGS(state, logs) {
      state.systemLogs = logs
    },
    ADD_PERFORMANCE_DATA(state, { type, value, timestamp }) {
      state.performanceData[type].push({ value, timestamp })
      // Garder seulement les 60 dernières minutes de données
      if (state.performanceData[type].length > 60) {
        state.performanceData[type].shift()
      }
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },

  actions: {
    async fetchServices({ commit }) {
      try {
        const response = await axios.get('/api/admin/services')
        commit('SET_SERVICES', response.data)
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async toggleService({ commit }, { serviceId, action }) {
      try {
        await axios.post(`/api/admin/services/${serviceId}/${action}`)
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async fetchSystemResources({ commit }) {
      try {
        const response = await axios.get('/api/admin/resources')
        commit('SET_SYSTEM_RESOURCES', response.data)
        
        // Ajouter les données aux graphiques de performance
        const timestamp = new Date().getTime()
        commit('ADD_PERFORMANCE_DATA', {
          type: 'cpu',
          value: response.data.cpu,
          timestamp
        })
        commit('ADD_PERFORMANCE_DATA', {
          type: 'memory',
          value: response.data.memory.percentage,
          timestamp
        })
        commit('ADD_PERFORMANCE_DATA', {
          type: 'disk',
          value: response.data.disk.percentage,
          timestamp
        })
        
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async fetchSystemLogs({ commit }) {
      try {
        const response = await axios.get('/api/admin/logs')
        commit('SET_SYSTEM_LOGS', response.data)
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async fetchServiceLogs({ commit }, serviceId) {
      try {
        const response = await axios.get(`/api/admin/services/${serviceId}/logs`)
        commit('CLEAR_ERROR')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async clearSystemLogs({ commit }) {
      try {
        await axios.delete('/api/admin/logs')
        commit('SET_SYSTEM_LOGS', [])
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async backupDatabase({ commit }) {
      try {
        await axios.post('/api/admin/database/backup')
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async optimizeDatabase({ commit }) {
      try {
        await axios.post('/api/admin/database/optimize')
        commit('CLEAR_ERROR')
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
}

export default admin 