<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </v-col>
    </v-row>

    <template v-else-if="campaign">
      <!-- En-tête -->
      <v-row class="mb-4">
        <v-col cols="8">
          <div class="d-flex align-center">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.back()"
              class="mr-4"
            />
            <h2 class="text-h4">{{ campaign.name }}</h2>
          </div>
        </v-col>
        <v-col cols="4" class="text-right">
          <v-chip
            :color="getStatusColor(campaign.status)"
            class="mr-2"
          >
            {{ campaign.status }}
          </v-chip>
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            @click="editCampaign"
          >
            Modifier
          </v-btn>
        </v-col>
      </v-row>

      <!-- Métriques principales -->
      <v-row class="mb-6">
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-subtitle-1 mb-2">Budget</div>
              <div class="text-h5">{{ formatCurrency(campaign.budget) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-subtitle-1 mb-2">Dépenses</div>
              <div class="text-h5">{{ formatCurrency(campaign.spent) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-subtitle-1 mb-2">Revenus</div>
              <div class="text-h5">{{ formatCurrency(campaign.revenue) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card>
            <v-card-text>
              <div class="text-subtitle-1 mb-2">ROI</div>
              <div class="text-h5" :class="getRoiColor(campaign.roi)">
                {{ formatPercentage(campaign.roi) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Graphiques -->
      <v-row>
        <v-col cols="12" lg="8">
          <v-card>
            <v-card-title>Performance dans le temps</v-card-title>
            <v-card-text>
              <v-chart
                :option="timeSeriesChartOption"
                autoresize
                style="width: 100%; height: 400px;"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card>
            <v-card-title>Répartition des conversions</v-card-title>
            <v-card-text>
              <v-chart
                :option="conversionsPieChartOption"
                autoresize
                style="width: 100%; height: 400px;"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tableau des actions -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title>Historique des actions</v-card-title>
            <v-data-table
              :headers="actionHeaders"
              :items="campaign.actions"
              :items-per-page="5"
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.raw.date) }}
              </template>
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getActionColor(item.raw.type)"
                  size="small"
                >
                  {{ item.raw.type }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-alert
          type="error"
          text="Impossible de charger les données de la campagne"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

export default {
  name: 'CampaignAnalytics',

  components: {
    VChart
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    // État
    const campaign = computed(() => store.getters['marketing/campaigns/getCurrentCampaign']);
    const loading = computed(() => store.getters['marketing/campaigns/isLoading']);
    const error = computed(() => store.getters['marketing/campaigns/getError']);

    // Configuration
    const actionHeaders = [
      { title: 'Date', key: 'date' },
      { title: 'Type', key: 'type' },
      { title: 'Description', key: 'description' },
      { title: 'Utilisateur', key: 'user' }
    ];

    // Options des graphiques
    const timeSeriesChartOption = computed(() => ({
      title: {
        text: 'Performance de la campagne'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Dépenses', 'Revenus', 'ROI']
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: [
        {
          type: 'value',
          name: 'Montant (€)',
          position: 'left'
        },
        {
          type: 'value',
          name: 'ROI (%)',
          position: 'right'
        }
      ],
      series: [
        {
          name: 'Dépenses',
          type: 'line',
          data: campaign.value?.timeSeriesData?.spent || []
        },
        {
          name: 'Revenus',
          type: 'line',
          data: campaign.value?.timeSeriesData?.revenue || []
        },
        {
          name: 'ROI',
          type: 'line',
          yAxisIndex: 1,
          data: campaign.value?.timeSeriesData?.roi || []
        }
      ]
    }));

    const conversionsPieChartOption = computed(() => ({
      title: {
        text: 'Sources de conversion'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: campaign.value?.conversionSources || [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }));

    // Méthodes
    const fetchCampaignData = async () => {
      try {
        await store.dispatch('marketing/campaigns/fetchCampaignDetails', props.id);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    };

    const editCampaign = () => {
      router.push({ name: 'Marketing', query: { tab: 'campaigns', edit: props.id } });
    };

    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        paused: 'warning',
        ended: 'error',
        scheduled: 'info'
      };
      return colors[status] || 'grey';
    };

    const getActionColor = (type) => {
      const colors = {
        update: 'info',
        pause: 'warning',
        resume: 'success',
        end: 'error'
      };
      return colors[type] || 'grey';
    };

    const getRoiColor = (roi) => {
      if (roi > 200) return 'text-success';
      if (roi > 100) return 'text-info';
      if (roi > 0) return 'text-warning';
      return 'text-error';
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    };

    const formatPercentage = (value) => {
      return `${value.toFixed(2)}%`;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Chargement initial
    onMounted(() => {
      fetchCampaignData();
    });

    return {
      // État
      campaign,
      loading,
      error,

      // Configuration
      actionHeaders,
      timeSeriesChartOption,
      conversionsPieChartOption,

      // Méthodes
      editCampaign,
      getStatusColor,
      getActionColor,
      getRoiColor,
      formatCurrency,
      formatPercentage,
      formatDate
    };
  }
};
</script>

<style scoped>
.text-success {
  color: var(--v-success-base);
}

.text-info {
  color: var(--v-info-base);
}

.text-warning {
  color: var(--v-warning-base);
}

.text-error {
  color: var(--v-error-base);
}
</style> 