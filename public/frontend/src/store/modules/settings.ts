import { Module, Commit } from 'vuex'
import type { Settings, SettingsState, TwoFactorResponse } from '@/types/settings'
import type { RootState } from '@/types'
import api from '@/api'

const state: SettingsState = {
  settings: null,
  loading: false,
  error: null
}

const mutations = {
  SET_SETTINGS(state: SettingsState, settings: Settings) {
    state.settings = settings
  },
  SET_LOADING(state: SettingsState, loading: boolean) {
    state.loading = loading
  },
  SET_ERROR(state: SettingsState, error: string | null) {
    state.error = error
  }
}

const actions = {
  async fetchSettings({ commit }: { commit: Commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get<{ settings: Settings }>('/settings')
      commit('SET_SETTINGS', response.data.settings)
    } catch (error: any) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateSettings({ commit }: { commit: Commit }, settings: Partial<Settings>) {
    commit('SET_LOADING', true)
    try {
      const response = await api.put<{ settings: Settings }>('/settings', settings)
      commit('SET_SETTINGS', response.data.settings)
      return response.data.settings
    } catch (error: any) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async generateTwoFactorSecret({ commit }: { commit: Commit }) {
    try {
      const response = await api.post<TwoFactorResponse>('/settings/2fa/generate')
      return response.data
    } catch (error: any) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async verifyTwoFactor({ commit }: { commit: Commit }, code: string) {
    try {
      await api.post('/settings/2fa/verify', { code })
    } catch (error: any) {
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  async disableTwoFactor({ commit }: { commit: Commit }) {
    try {
      await api.post('/settings/2fa/disable')
    } catch (error: any) {
      commit('SET_ERROR', error.message)
      throw error
    }
  }
}

const getters = {
  settings: (state: SettingsState) => state.settings,
  isLoading: (state: SettingsState) => state.loading,
  error: (state: SettingsState) => state.error
}

const settingsModule: Module<SettingsState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

export default settingsModule 