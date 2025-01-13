import api from '@/api';

const state = {
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null
};

const getters = {
  getCampaigns: state => state.campaigns,
  getCurrentCampaign: state => state.currentCampaign,
  isLoading: state => state.loading,
  getError: state => state.error
};

const actions = {
  async fetchCampaigns({ commit }, filters = {}) {
    try {
      commit('SET_LOADING', true);
      const response = await api.get('/marketing/campaigns', { params: filters });
      commit('SET_CAMPAIGNS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createCampaign({ commit }, campaignData) {
    try {
      commit('SET_LOADING', true);
      const response = await api.post('/marketing/campaigns', campaignData);
      commit('ADD_CAMPAIGN', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateCampaign({ commit }, { id, data }) {
    try {
      commit('SET_LOADING', true);
      const response = await api.put(`/marketing/campaigns/${id}`, data);
      commit('UPDATE_CAMPAIGN', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteCampaign({ commit }, id) {
    try {
      commit('SET_LOADING', true);
      await api.delete(`/marketing/campaigns/${id}`);
      commit('REMOVE_CAMPAIGN', id);
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async fetchCampaignDetails({ commit }, id) {
    try {
      commit('SET_LOADING', true);
      const response = await api.get(`/marketing/campaigns/${id}`);
      commit('SET_CURRENT_CAMPAIGN', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  clearCurrentCampaign({ commit }) {
    commit('SET_CURRENT_CAMPAIGN', null);
  },

  clearError({ commit }) {
    commit('SET_ERROR', null);
  }
};

const mutations = {
  SET_CAMPAIGNS(state, campaigns) {
    state.campaigns = campaigns;
  },

  ADD_CAMPAIGN(state, campaign) {
    state.campaigns.unshift(campaign);
  },

  UPDATE_CAMPAIGN(state, updatedCampaign) {
    const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id);
    if (index !== -1) {
      state.campaigns.splice(index, 1, updatedCampaign);
    }
    if (state.currentCampaign?.id === updatedCampaign.id) {
      state.currentCampaign = updatedCampaign;
    }
  },

  REMOVE_CAMPAIGN(state, id) {
    state.campaigns = state.campaigns.filter(c => c.id !== id);
    if (state.currentCampaign?.id === id) {
      state.currentCampaign = null;
    }
  },

  SET_CURRENT_CAMPAIGN(state, campaign) {
    state.currentCampaign = campaign;
  },

  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  SET_ERROR(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}; 