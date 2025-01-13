import logger from '@/services/logger'

export default {
  namespaced: true,
  
  state: {
    errors: [],
    notifications: []
  },

  mutations: {
    ADD_ERROR(state, error) {
      state.errors.push({
        id: Date.now(),
        message: error.message || 'Une erreur est survenue',
        type: error.type || 'error',
        timestamp: new Date(),
        details: error.details || null
      })
    },
    REMOVE_ERROR(state, errorId) {
      state.errors = state.errors.filter(error => error.id !== errorId)
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        message: notification.message,
        type: notification.type || 'info',
        timestamp: new Date(),
        duration: notification.duration || 5000
      })
    },
    REMOVE_NOTIFICATION(state, notificationId) {
      state.notifications = state.notifications.filter(notif => notif.id !== notificationId)
    },
    CLEAR_ALL(state) {
      state.errors = []
      state.notifications = []
    }
  },

  actions: {
    addError({ commit }, error) {
      logger.error('Erreur application:', error)
      commit('ADD_ERROR', error)
      
      // Auto-suppression après 10 secondes
      setTimeout(() => {
        commit('REMOVE_ERROR', error.id)
      }, 10000)
    },

    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
      
      // Auto-suppression après la durée spécifiée
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', notification.id)
      }, notification.duration || 5000)
    },

    removeError({ commit }, errorId) {
      commit('REMOVE_ERROR', errorId)
    },

    removeNotification({ commit }, notificationId) {
      commit('REMOVE_NOTIFICATION', notificationId)
    },

    clearAll({ commit }) {
      commit('CLEAR_ALL')
    }
  },

  getters: {
    hasErrors: state => state.errors.length > 0,
    getErrors: state => state.errors,
    getNotifications: state => state.notifications,
    getLatestError: state => state.errors[state.errors.length - 1],
    getLatestNotification: state => state.notifications[state.notifications.length - 1]
  }
} 