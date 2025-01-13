type State = { items: any[] }
type Notification = { id?: string, message: string, type: string }
type Context = { commit: (type: string, payload: any) => void }

export default {
  namespaced: true,
  state(): State {
    return {
      items: []
    }
  },
  mutations: {
    ADD_NOTIFICATION(state: State, notification: Notification) {
      state.items.push(notification)
    },
    REMOVE_NOTIFICATION(state: State, id: string) {
      state.items = state.items.filter(item => item.id !== id)
    }
  },
  actions: {
    addNotification({ commit }: Context, notification: Notification) {
      const id = Math.random().toString(36).substring(2, 11)
      commit('ADD_NOTIFICATION', { ...notification, id })
    },
    removeNotification({ commit }: Context, id: string) {
      commit('REMOVE_NOTIFICATION', id)
    }
  }
} 