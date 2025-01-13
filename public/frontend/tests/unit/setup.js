import { config } from '@vue/test-utils'
import { createStore } from 'vuex'

// Configuration globale pour les tests
config.global.mocks = {
  $store: createStore({
    state: {},
    mutations: {},
    actions: {},
    modules: {}
  })
}

// Mock des composants globaux si nécessaire
config.global.components = {} 