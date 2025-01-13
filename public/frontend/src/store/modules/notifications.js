const state = {
  items: [],
  loading: false,
  error: null
}

const getters = {
  unreadCount: state => state.items.filter(n => !n.read).length,
  allNotifications: state => state.items,
  isLoading: state => state.loading,
  getError: state => state.error
}

const actions = {
  async fetchNotifications({ commit }) {
    try {
      commit('SET_LOADING', true)
      const response = await this._vm.$axios.get('/api/notifications')
      commit('SET_NOTIFICATIONS', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async markAsRead({ commit }, notificationIds = null) {
    try {
      commit('SET_LOADING', true)
      if (notificationIds) {
        await this._vm.$axios.post('/api/notifications/mark-read', { ids: notificationIds })
        commit('MARK_NOTIFICATIONS_READ', notificationIds)
      } else {
        await this._vm.$axios.post('/api/notifications/mark-all-read')
        commit('MARK_ALL_READ')
      }
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteNotification({ commit }, id) {
    try {
      commit('SET_LOADING', true)
      await this._vm.$axios.delete(`/api/notifications/${id}`)
      commit('DELETE_NOTIFICATION', id)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const mutations = {
  SET_NOTIFICATIONS(state, notifications) {
    state.items = notifications
  },

  ADD_NOTIFICATION(state, notification) {
    state.items.unshift(notification)
  },

  MARK_NOTIFICATIONS_READ(state, ids) {
    state.items = state.items.map(notification => {
      if (ids.includes(notification.id)) {
        return { ...notification, read: true }
      }
      return notification
    })
  },

  MARK_ALL_READ(state) {
    state.items = state.items.map(notification => ({ ...notification, read: true }))
  },

  DELETE_NOTIFICATION(state, id) {
    state.items = state.items.filter(notification => notification.id !== id)
  },

  SET_LOADING(state, value) {
    state.loading = value
  },

  SET_ERROR(state, error) {
    state.error = error
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
} 