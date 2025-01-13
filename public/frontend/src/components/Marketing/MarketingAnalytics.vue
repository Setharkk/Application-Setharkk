<template>
  <v-container>
    <!-- Sélecteur de période -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="timeframe"
          :items="timeframeOptions"
          label="Période"
          @update:model-value="handleTimeframeChange"
        />
      </v-col>
    </v-row>

    <!-- Cartes de métriques -->
    <v-row>
      <v-col v-for="(value, key) in metrics" :key="key" cols="12" sm="6" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 mb-2">
              {{ formatMetric(key, value) }}
            </div>
            <div class="text-subtitle-1 text-medium-emphasis">
              {{ getMetricLabel(key) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graphiques de tendances -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Tendances</v-card-title>
          <v-card-text>
            <v-chart class="chart" :option="chartOption" autoresize />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Liste des campagnes -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            Campagnes actives
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="createCampaign"
            >
              Nouvelle campagne
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>ROI</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.id">
                  <td>{{ campaign.name }}</td>
                  <td>
                    <v-chip
                      :color="getStatusColor(campaign.status)"
                      size="small"
                    >
                      {{ campaign.status }}
                    </v-chip>
                  </td>
                  <td>{{ formatCurrency(campaign.budget) }}</td>
                  <td>{{ formatPercentage(campaign.roi) }}</td>
                  <td>
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      @click="editCampaign(campaign)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      @click="deleteCampaign(campaign)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPIs personnalisables -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            KPIs personnalisés
            <v-spacer />
            <v-btn color="primary" @click="showKPIDialog = true">
              Ajouter un KPI
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="kpi in customKPIs" :key="kpi.id" cols="12" md="4">
                <v-card outlined>
                  <v-card-title>{{ kpi.name }}</v-card-title>
                  <v-card-text>
                    <div class="text-h4">
                      {{ calculateKPI(kpi) }}{{ kpi.unit }}
                    </div>
                    <div class="text-caption">
                      Objectif: {{ kpi.target }}{{ kpi.unit }}
                    </div>
                    <v-progress-linear
                      :value="(calculateKPI(kpi) / kpi.target) * 100"
                      :color="getProgressColor(calculateKPI(kpi), kpi.target)"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graphiques prédictifs -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Prévisions et Tendances</v-card-title>
          <v-card-text>
            <v-chart class="chart" :option="advancedChartOptions" autoresize />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal d'ajout de KPI -->
    <v-dialog v-model="showKPIDialog" max-width="600px">
      <v-card>
        <v-card-title>Ajouter un KPI personnalisé</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveCustomKPI">
            <v-text-field
              v-model="newKPI.name"
              label="Nom du KPI"
              required
            />
            <v-text-field
              v-model="newKPI.formula"
              label="Formule de calcul"
              hint="Exemple: conversions / visitors * 100"
              required
            />
            <v-text-field
              v-model="newKPI.target"
              label="Objectif"
              type="number"
              required
            />
            <v-text-field
              v-model="newKPI.unit"
              label="Unité"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="showKPIDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveCustomKPI">Sauvegarder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Message d'erreur -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
    >
      {{ error }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="clearError"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import * as echarts from 'echarts'
import { LinearRegression } from 'ml-regression'

// KPIs personnalisables
const customKPIs = ref([
  {
    id: 'conversion_rate',
    name: 'Taux de conversion',
    formula: 'conversions / visitors * 100',
    target: 5,
    unit: '%'
  },
  {
    id: 'customer_ltv',
    name: 'Valeur client (LTV)',
    formula: 'total_revenue / unique_customers',
    target: 1000,
    unit: '€'
  },
  {
    id: 'roi',
    name: 'ROI',
    formula: '(revenue - cost) / cost * 100',
    target: 200,
    unit: '%'
  }
])

// Données pour les prévisions
const forecastData = ref({
  historical: [],
  predictions: [],
  confidence: 0.95
})

// Fonction de prévision basée sur l'IA
const generatePredictions = (historicalData: any[]) => {
  const x = historicalData.map((_, index) => [index])
  const y = historicalData.map(d => d.value)
  
  const regression = new LinearRegression(x, y)
  const predictions = []
  
  // Générer des prévisions pour les 30 prochains jours
  for (let i = x.length; i < x.length + 30; i++) {
    predictions.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      value: regression.predict([i])[0]
    })
  }
  
  return predictions
}

// Configuration des graphiques avancés
const advancedChartOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['Réel', 'Prévision', 'Intervalle de confiance']
  },
  xAxis: {
    type: 'time',
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: '{value}'
    }
  },
  series: [
    {
      name: 'Réel',
      type: 'line',
      data: forecastData.value.historical,
      smooth: true
    },
    {
      name: 'Prévision',
      type: 'line',
      data: forecastData.value.predictions,
      smooth: true,
      lineStyle: {
        type: 'dashed'
      }
    },
    {
      name: 'Intervalle de confiance',
      type: 'line',
      data: calculateConfidenceInterval(forecastData.value.predictions),
      smooth: true,
      lineStyle: {
        opacity: 0.2
      },
      areaStyle: {
        opacity: 0.1
      }
    }
  ]
}))

// Fonction pour calculer l'intervalle de confiance
const calculateConfidenceInterval = (predictions: any[]) => {
  const confidence = forecastData.value.confidence
  return predictions.map(p => ({
    date: p.date,
    low: p.value * (1 - confidence),
    high: p.value * (1 + confidence)
  }))
}

const store = useStore()
const timeframe = ref('7d')
const showError = ref(false)

const timeframeOptions = [
  { title: '7 derniers jours', value: '7d' },
  { title: '30 derniers jours', value: '30d' },
  { title: '3 derniers mois', value: '90d' },
  { title: '12 derniers mois', value: '365d' }
]

// Données du store
const metrics = computed(() => store.getters['marketingAnalytics/getMetrics'])
const trends = computed(() => store.getters['marketingAnalytics/getTrends'])
const campaigns = computed(() => store.getters['marketingAnalytics/getCampaigns'])
const error = computed(() => store.getters['marketingAnalytics/getError'])

// Configuration du graphique
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['Visiteurs', 'Conversions', 'Revenus']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trends.value.map(t => t.date)
  },
  yAxis: [
    {
      type: 'value',
      name: 'Visiteurs/Conversions'
    },
    {
      type: 'value',
      name: 'Revenus',
      axisLabel: {
        formatter: '{value} €'
      }
    }
  ],
  series: [
    {
      name: 'Visiteurs',
      type: 'line',
      data: trends.value.map(t => t.visitors)
    },
    {
      name: 'Conversions',
      type: 'line',
      data: trends.value.map(t => t.conversions)
    },
    {
      name: 'Revenus',
      type: 'line',
      yAxisIndex: 1,
      data: trends.value.map(t => t.revenue)
    }
  ]
}))

// Méthodes
const handleTimeframeChange = (value) => {
  store.dispatch('marketingAnalytics/setTimeframe', value)
}

const formatMetric = (key, value) => {
  switch (key) {
    case 'visitors':
      return value.toLocaleString()
    case 'conversions':
      return `${value.toFixed(2)}%`
    case 'revenue':
      return formatCurrency(value)
    case 'roi':
      return formatPercentage(value)
    default:
      return value
  }
}

const getMetricLabel = (key) => {
  const labels = {
    visitors: 'Visiteurs',
    conversions: 'Taux de conversion',
    revenue: 'Revenus',
    roi: 'ROI'
  }
  return labels[key] || key
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    ended: 'error'
  }
  return colors[status] || 'grey'
}

const createCampaign = () => {
  // TODO: Implémenter la création de campagne
  console.log('Créer une nouvelle campagne')
}

const editCampaign = (campaign) => {
  // TODO: Implémenter l'édition de campagne
  console.log('Éditer la campagne', campaign)
}

const deleteCampaign = (campaign) => {
  // TODO: Implémenter la suppression de campagne
  console.log('Supprimer la campagne', campaign)
}

const clearError = () => {
  store.dispatch('marketingAnalytics/clearError')
  showError.value = false
}

// Surveillance des erreurs
watch(() => error.value, (newError) => {
  if (newError) {
    showError.value = true
  }
})

// Chargement initial des données
onMounted(() => {
  store.dispatch('marketingAnalytics/fetchMetrics')
  store.dispatch('marketingAnalytics/fetchTrends')
  store.dispatch('marketingAnalytics/fetchCampaigns')
})

const showKPIDialog = ref(false)
const newKPI = ref({
  name: '',
  formula: '',
  target: 0,
  unit: ''
})

const saveCustomKPI = () => {
  // TODO: Implémenter la sauvegarde du KPI personnalisé
  console.log('Sauvegarder le KPI personnalisé', newKPI.value)
  showKPIDialog.value = false
}

const calculateKPI = (kpi) => {
  // TODO: Implémenter le calcul du KPI personnalisé
  console.log('Calculer le KPI personnalisé', kpi)
  return 0
}

const getProgressColor = (value, target) => {
  const percentage = (value / target) * 100
  if (percentage < 50) {
    return 'success'
  } else if (percentage < 100) {
    return 'warning'
  } else {
    return 'error'
  }
}
</script>

<style scoped>
.chart {
  height: 400px;
}
</style> 