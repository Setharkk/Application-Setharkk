import { config } from '@vue/test-utils';
import { createStore } from 'vuex';

// Configuration globale pour Vue Test Utils
config.global.mocks = {
  $store: createStore({
    state: {
      // État initial pour les tests
    }
  })
};

// Mock des API Electron
global.window.electronAPI = {
  getData: jest.fn(),
  setData: jest.fn(),
  deleteData: jest.fn(),
  analyzeSeo: jest.fn()
};

// Mock des variables d'environnement
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  VUE_APP_API_URL: 'http://localhost:3000'
}; 