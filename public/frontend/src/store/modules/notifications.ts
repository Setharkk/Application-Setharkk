import { Module, Commit } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import type { Notification, NotificationsState } from '@/types/notifications'
import type { RootState } from '@/types'

const state: NotificationsState = {
  notifications: []
}

const mutations = {
  ADD_NOTIFICATION(state: NotificationsState, notification: Notification) {
    state.notifications.push(notification)
  },
  REMOVE_NOTIFICATION(state: NotificationsState, id: string) {
    state.notifications = state.notifications.filter(n => n.id !== id)
  },
  CLEAR_NOTIFICATIONS(state: NotificationsState) {
    state.notifications = []
  }
}

const actions = {
  addNotification({ commit }: { commit: Commit }, notification: Omit<Notification, 'id'>) {
    const id = uuidv4()
    const fullNotification = {
      ...notification,
      id,
      dismissible: notification.dismissible ?? true,
      timeout: notification.timeout ?? 5000
    }

    commit('ADD_NOTIFICATION', fullNotification)

    if (fullNotification.timeout > 0) {
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', id)
      }, fullNotification.timeout)
    }

    return id
  },

  removeNotification({ commit }: { commit: Commit }, id: string) {
    commit('REMOVE_NOTIFICATION', id)
  },

  clearNotifications({ commit }: { commit: Commit }) {
    commit('CLEAR_NOTIFICATIONS')
  }
}

const getters = {
  notifications: (state: NotificationsState) => state.notifications
}

const notificationsModule: Module<NotificationsState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default notificationsModule 