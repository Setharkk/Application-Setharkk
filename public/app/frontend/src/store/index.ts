import { createStore } from 'vuex'

export interface RootState {
  darkMode: boolean
  language: string
  notifications: boolean
}

export default createStore<RootState>({
  state: {
    darkMode: false,
    language: 'fr',
    notifications: true
  },
  mutations: {
    SET_DARK_MODE(state: RootState, value: boolean) {
      state.darkMode = value
    },
    SET_LANGUAGE(state: RootState, value: string) {
      state.language = value
    },
    SET_NOTIFICATIONS(state: RootState, value: boolean) {
      state.notifications = value
    }
  },
  actions: {
    toggleDarkMode({ commit, state }: { commit: any, state: RootState }) {
      commit('SET_DARK_MODE', !state.darkMode)
    },
    setLanguage({ commit }: { commit: any }, language: string) {
      commit('SET_LANGUAGE', language)
    },
    toggleNotifications({ commit, state }: { commit: any, state: RootState }) {
      commit('SET_NOTIFICATIONS', !state.notifications)
    }
  },
  getters: {
    isDarkMode: (state: RootState) => state.darkMode,
    currentLanguage: (state: RootState) => state.language,
    notificationsEnabled: (state: RootState) => state.notifications
  }
}) 