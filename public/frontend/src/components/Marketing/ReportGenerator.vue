<template>
  <v-container>
    <!-- En-tête -->
    <v-row class="mb-4" align="center">
      <v-col cols="8">
        <h2 class="text-h4">Rapports automatisés</h2>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          :loading="loading"
        >
          Nouveau rapport
        </v-btn>
      </v-col>
    </v-row>

    <!-- Message d'erreur -->
    <v-alert
      v-if="error"
      type="error"
      closable
      class="mb-4"
      @click:close="clearError"
    >
      {{ error }}
    </v-alert>

    <!-- Liste des rapports -->
    <v-row>
      <v-col
        v-for="report in reports"
        :key="report.id"
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <h3 class="text-h6">{{ report.name }}</h3>
                <div class="text-subtitle-2 text-medium-emphasis">
                  Format: {{ report.format.toUpperCase() }}
                </div>
              </div>
              <div>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  @click="editReport(report)"
                />
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  @click="generateReport(report.id)"
                  :loading="loading"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  @click="confirmDelete(report)"
                />
              </div>
            </div>

            <div class="mt-4">
              <v-chip
                class="mr-2 mb-2"
                prepend-icon="mdi-clock-outline"
              >
                {{ getFrequencyLabel(report.frequency) }}
              </v-chip>
              <v-chip
                class="mr-2 mb-2"
                prepend-icon="mdi-email-outline"
              >
                {{ report.recipients.length }} destinataires
              </v-chip>
              <v-chip
                v-if="report.autoSend"
                color="primary"
                class="mb-2"
              >
                Envoi automatique
              </v-chip>
            </div>

            <div class="mt-4">
              <div class="text-subtitle-2 mb-2">Métriques incluses :</div>
              <v-chip-group>
                <v-chip
                  v-for="metric in report.metrics"
                  :key="metric"
                  size="small"
                >
                  {{ getMetricLabel(metric) }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de création/édition -->
    <v-dialog
      v-model="dialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title>
          {{ selectedReport ? 'Modifier le rapport' : 'Nouveau rapport' }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Nom du rapport"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.frequency"
                  :items="frequencies"
                  item-title="label"
                  item-value="value"
                  label="Fréquence"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.format"
                  :items="formats"
                  item-title="label"
                  item-value="value"
                  label="Format"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.template"
                  :items="templates"
                  item-title="label"
                  item-value="value"
                  label="Template"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.metrics"
                  :items="availableMetrics"
                  item-title="label"
                  item-value="value"
                  label="Métriques"
                  multiple
                  chips
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.recipients"
                  label="Destinataires (séparés par des virgules)"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="formData.autoSend"
                  label="Envoi automatique"
                  color="primary"
                />
              </v-col>

              <v-col cols="12">
                <v-expansion-panels>
                  <v-expansion-panel title="Filtres avancés">
                    <v-expansion-panel-text>
                      <v-select
                        v-model="formData.filters.dateRange"
                        :items="[
                          { label: '7 derniers jours', value: '7d' },
                          { label: '30 derniers jours', value: '30d' },
                          { label: '90 derniers jours', value: '90d' }
                        ]"
                        label="Période"
                      />
                      
                      <v-select
                        v-model="formData.filters.campaigns"
                        :items="store.getters['campaigns/getAllCampaigns']"
                        item-title="name"
                        item-value="id"
                        label="Campagnes"
                        multiple
                        chips
                      />
                      
                      <v-select
                        v-model="formData.filters.channels"
                        :items="[
                          { label: 'Email', value: 'email' },
                          { label: 'Social', value: 'social' },
                          { label: 'Search', value: 'search' }
                        ]"
                        label="Canaux"
                        multiple
                        chips
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="dialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            @click="handleSubmit"
            :loading="loading"
          >
            {{ selectedReport ? 'Modifier' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer ce rapport ?
          Cette action est irréversible.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="error"
            @click="deleteReport"
            :loading="loading"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface Report {
  id: string
  name: string
  frequency: string
  metrics: string[]
  recipients: string[]
  autoSend: boolean
  format: string
  template: string
  filters: {
    dateRange: string
    campaigns: string[]
    channels: string[]
  }
}

// État
const store = useStore()
const dialog = ref(false)
const deleteDialog = ref(false)
const selectedReport = ref<Report | null>(null)
const loading = ref(false)

// Données du formulaire
const formData = ref({
  name: '',
  frequency: 'weekly',
  metrics: [],
  recipients: '',
  autoSend: true,
  format: 'pdf',
  template: 'standard',
  filters: {
    dateRange: '30d',
    campaigns: [],
    channels: []
  }
})

// Options disponibles
const frequencies = [
  { label: 'Quotidien', value: 'daily' },
  { label: 'Hebdomadaire', value: 'weekly' },
  { label: 'Mensuel', value: 'monthly' },
  { label: 'Trimestriel', value: 'quarterly' }
]

const formats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
  { label: 'CSV', value: 'csv' }
]

const templates = [
  { label: 'Standard', value: 'standard' },
  { label: 'Détaillé', value: 'detailed' },
  { label: 'Résumé', value: 'summary' },
  { label: 'Personnalisé', value: 'custom' }
]

const availableMetrics = [
  { label: 'Visiteurs', value: 'visitors' },
  { label: 'Conversions', value: 'conversions' },
  { label: 'Revenus', value: 'revenue' },
  { label: 'ROI', value: 'roi' },
  { label: 'Coût par acquisition', value: 'cpa' },
  { label: 'Taux d\'engagement', value: 'engagement_rate' },
  { label: 'Temps moyen sur site', value: 'avg_time_on_site' }
]

// Getters
const reports = computed(() => store.getters['reports/getReports'])
const error = computed(() => store.getters['reports/getError'])

// Méthodes
const generateReport = async (reportId: string) => {
  loading.value = true
  try {
    const data = await store.dispatch('reports/generateReport', reportId)
    const report = reports.value.find(r => r.id === reportId)
    
    switch (report?.format) {
      case 'pdf':
        generatePDF(data, report)
        break
      case 'excel':
        generateExcel(data, report)
        break
      case 'csv':
        generateCSV(data, report)
        break
    }
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
  } finally {
    loading.value = false
  }
}

const generatePDF = (data: any, report: Report) => {
  const doc = new jsPDF()
  
  // En-tête
  doc.setFontSize(20)
  doc.text(report.name, 20, 20)
  
  // Métriques principales
  doc.autoTable({
    head: [['Métrique', 'Valeur']],
    body: data.metrics.map(m => [m.label, m.value])
  })
  
  // Graphiques et visualisations
  // TODO: Ajouter les graphiques
  
  doc.save(`${report.name}_${new Date().toISOString()}.pdf`)
}

const generateExcel = (data: any, report: Report) => {
  const wb = XLSX.utils.book_new()
  
  // Feuille des métriques
  const wsMetrics = XLSX.utils.json_to_sheet(data.metrics)
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métriques')
  
  // Feuille des tendances
  const wsTrends = XLSX.utils.json_to_sheet(data.trends)
  XLSX.utils.book_append_sheet(wb, wsTrends, 'Tendances')
  
  XLSX.writeFile(wb, `${report.name}_${new Date().toISOString()}.xlsx`)
}

const generateCSV = (data: any, report: Report) => {
  const csv = data.metrics.map(m => `${m.label},${m.value}`).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `${report.name}_${new Date().toISOString()}.csv`)
}

const scheduleReport = async (report: Report) => {
  try {
    await store.dispatch('reports/scheduleReport', {
      id: report.id,
      schedule: {
        frequency: report.frequency,
        recipients: report.recipients,
        autoSend: report.autoSend
      }
    })
  } catch (error) {
    console.error('Erreur lors de la planification du rapport:', error)
  }
}

const getFrequencyLabel = (frequency: string) => {
  const freq = frequencies.find(f => f.value === frequency)
  return freq ? freq.label : frequency
}

const getMetricLabel = (metric: string) => {
  const met = availableMetrics.find(m => m.value === metric)
  return met ? met.label : metric
}

// Gestion du formulaire
const handleSubmit = async () => {
  if (selectedReport.value) {
    await store.dispatch('reports/updateReport', {
      id: selectedReport.value.id,
      data: formData.value
    })
  } else {
    await store.dispatch('reports/createReport', formData.value)
  }
  dialog.value = false
}

const openDialog = (report: Report | null = null) => {
  selectedReport.value = report
  if (report) {
    formData.value = { ...report }
  } else {
    formData.value = {
      name: '',
      frequency: 'weekly',
      metrics: [],
      recipients: '',
      autoSend: true,
      format: 'pdf',
      template: 'standard',
      filters: {
        dateRange: '30d',
        campaigns: [],
        channels: []
      }
    }
  }
  dialog.value = true
}

const confirmDelete = (report: Report) => {
  selectedReport.value = report
  deleteDialog.value = true
}

const deleteReport = async () => {
  if (selectedReport.value) {
    await store.dispatch('reports/deleteReport', selectedReport.value.id)
    deleteDialog.value = false
    selectedReport.value = null
  }
}

const clearError = () => {
  store.dispatch('reports/clearError')
}

// Chargement initial
onMounted(() => {
  store.dispatch('reports/fetchReports')
})
</script>

<style scoped>
.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 