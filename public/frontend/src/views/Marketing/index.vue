<template>
  <v-container fluid>
    <v-tabs
      v-model="activeTab"
      color="primary"
      align-tabs="center"
    >
      <v-tab value="analytics">
        <v-icon start>mdi-chart-box</v-icon>
        Analyses
      </v-tab>
      <v-tab value="campaigns">
        <v-icon start>mdi-bullhorn</v-icon>
        Campagnes
      </v-tab>
      <v-tab value="automation">
        <v-icon start>mdi-robot</v-icon>
        Automatisation
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <v-window-item value="analytics">
        <marketing-analytics />
      </v-window-item>

      <v-window-item value="campaigns">
        <campaign-manager />
      </v-window-item>

      <v-window-item value="automation">
        <automation-dashboard />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import MarketingAnalytics from '@/components/Marketing/MarketingAnalytics.vue';
import CampaignManager from '@/components/Marketing/CampaignManager.vue';
import AutomationDashboard from '@/components/Marketing/AutomationDashboard.vue';

export default {
  name: 'MarketingView',

  components: {
    MarketingAnalytics,
    CampaignManager,
    AutomationDashboard
  },

  setup() {
    const activeTab = ref('analytics');

    return {
      activeTab
    };
  }
};
</script> 