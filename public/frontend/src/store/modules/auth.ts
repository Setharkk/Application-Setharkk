import type { ActionContext, Commit, Dispatch } from 'vuex'
import type { AuthState, LoginCredentials, RegisterCredentials, User, AuthResponse, PasswordResetRequest, PasswordResetConfirm } from '@/types/auth'
import type { RootState } from '@/types'
import { Module } from 'vuex'
import api from '@/api'

type AuthContext = ActionContext<AuthState, RootState>

const state: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
}

const mutations = {
  SET_USER(state: AuthState, user: User | null) {
    state.user = user
  },
  SET_TOKEN(state: AuthState, token: string | null) {
    state.token = token
    state.isAuthenticated = !!token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  SET_LOADING(state: AuthState, loading: boolean) {
    state.loading = loading
  },
  SET_ERROR(state: AuthState, error: string | null) {
    state.error = error
  },
  CLEAR_AUTH(state: AuthState) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    state.error = null
    localStorage.removeItem('token')
  }
}

const actions = {
  async login({ commit, dispatch }: { commit: Commit, dispatch: Dispatch }, credentials: LoginCredentials) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      commit('SET_USER', response.data.user)
      commit('SET_TOKEN', response.data.token)
      dispatch('notifications/addNotification', {
        type: 'success',
        message: 'Connexion réussie !',
        timeout: 3000
      }, { root: true })
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la connexion'
      commit('SET_ERROR', errorMessage)
      dispatch('notifications/addNotification', {
        type: 'error',
        message: errorMessage,
        timeout: 5000
      }, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async register({ commit, dispatch }: { commit: Commit, dispatch: Dispatch }, credentials: RegisterCredentials) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials)
      commit('SET_USER', response.data.user)
      commit('SET_TOKEN', response.data.token)
      dispatch('notifications/addNotification', {
        type: 'success',
        message: 'Inscription réussie !',
        timeout: 3000
      }, { root: true })
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription'
      commit('SET_ERROR', errorMessage)
      dispatch('notifications/addNotification', {
        type: 'error',
        message: errorMessage,
        timeout: 5000
      }, { root: true })
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async logout({ commit, dispatch }: { commit: Commit, dispatch: Dispatch }) {
    try {
      await api.post('/auth/logout')
      dispatch('notifications/addNotification', {
        type: 'info',
        message: 'Vous avez été déconnecté',
        timeout: 3000
      }, { root: true })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      commit('CLEAR_AUTH')
    }
  },

  async fetchUser({ commit }: AuthContext) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.get<{ user: User }>('/auth/user')
      commit('SET_USER', response.data.user)
      return response.data.user
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Erreur lors de la récupération du profil')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateProfile({ commit }: AuthContext, userData: Partial<User>) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.put<{ user: User }>('/auth/profile', userData)
      commit('SET_USER', response.data.user)
      return response.data.user
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Erreur lors de la mise à jour du profil')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async requestPasswordReset({ commit }: AuthContext, data: PasswordResetRequest) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post('/auth/password/reset-request', data)
      return response.data
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Erreur lors de la demande de réinitialisation')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async resetPassword({ commit }: AuthContext, data: PasswordResetConfirm) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post('/auth/password/reset', data)
      return response.data
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Erreur lors de la réinitialisation du mot de passe')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  currentUser: (state: AuthState) => state.user,
  authError: (state: AuthState) => state.error,
  isLoading: (state: AuthState) => state.loading
}

const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default auth 