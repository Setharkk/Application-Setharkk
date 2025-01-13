import type { NavigationState } from '@/types/navigation'

const state: NavigationState = {
  drawer: null,
  userMenu: false,
  notificationsDialog: false
}

const mutations = {
  SET_DRAWER(state: NavigationState, value: boolean | null) {
    state.drawer = value
  },
  TOGGLE_DRAWER(state: NavigationState) {
    state.drawer = !state.drawer
  },
  SET_USER_MENU(state: NavigationState, value: boolean) {
    state.userMenu = value
  },
  SET_NOTIFICATIONS_DIALOG(state: NavigationState, value: boolean) {
    state.notificationsDialog = value
  }
}

const actions = {
  setDrawer({ commit }: { commit: Function }, value: boolean | null) {
    commit('SET_DRAWER', value)
  },
  toggleDrawer({ commit }: { commit: Function }) {
    commit('TOGGLE_DRAWER')
  },
  setUserMenu({ commit }: { commit: Function }, value: boolean) {
    commit('SET_USER_MENU', value)
  },
  setNotificationsDialog({ commit }: { commit: Function }, value: boolean) {
    commit('SET_NOTIFICATIONS_DIALOG', value)
  }
}

const getters = {
  isDrawerOpen: (state: NavigationState) => state.drawer,
  isUserMenuOpen: (state: NavigationState) => state.userMenu,
  isNotificationsDialogOpen: (state: NavigationState) => state.notificationsDialog
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 