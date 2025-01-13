import api from '@/api';
import router from '@/router';

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null
};

const getters = {
  isAuthenticated: state => !!state.token,
  getUser: state => state.user,
  isLoading: state => state.loading,
  getError: state => state.error
};

const actions = {
  async login({ commit }, credentials) {
    try {
      commit('SET_LOADING', true);
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      commit('SET_TOKEN', token);
      commit('SET_USER', user);
      
      // Configuration du token pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      router.push({ name: 'Home' });
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Erreur de connexion');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async register({ commit }, userData) {
    try {
      commit('SET_LOADING', true);
      await api.post('/auth/register', userData);
      router.push({ name: 'Login', query: { registered: 'success' } });
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Erreur d\'inscription');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async logout({ commit }) {
    try {
      commit('SET_LOADING', true);
      await api.post('/auth/logout');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      delete api.defaults.headers.common['Authorization'];
      
      commit('CLEAR_AUTH');
      router.push({ name: 'Login' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async refreshToken({ commit }) {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      commit('SET_TOKEN', token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      commit('CLEAR_AUTH');
      router.push({ name: 'Login' });
    }
  },

  clearError({ commit }) {
    commit('SET_ERROR', null);
  }
};

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
  },

  SET_USER(state, user) {
    state.user = user;
  },

  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  },

  CLEAR_AUTH(state) {
    state.token = null;
    state.user = null;
    state.error = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 