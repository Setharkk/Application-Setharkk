<template>
  <div class="make-integration-panel">
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          @click="refreshData"
          :loading="loading"
          class="mb-4"
        >
          Rafraîchir les scénarios
        </v-btn>
      </v-col>
    </v-row>

    <!-- Scénarios -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Scénarios Make.com
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Rechercher"
              single-line
              hide-details
              class="ml-4"
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="scenarioHeaders"
              :items="scenarios"
              :loading="loading"
              :search="search"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.lastRun="{ item }">
                <v-chip
                  :color="getLastRunColor(item.lastRunStatus)"
                  small
                >
                  {{ formatDate(item.lastRun) }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  @click="executeScenario(item)"
                  :disabled="!item.isActive || item.status === 'En cours'"
                >
                  <v-icon>mdi-play</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="viewScenario(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="toggleScenario(item)"
                >
                  <v-icon>{{ item.isActive ? 'mdi-pause' : 'mdi-play-circle' }}</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="showHistoryDialog(item)"
                >
                  <v-icon>mdi-history</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogue Historique -->
    <v-dialog
      v-model="showHistory"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn
            icon
            dark
            @click="showHistory = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Historique des exécutions</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            dark
            text
            @click="exportHistory"
          >
            Exporter
            <v-icon right>mdi-export</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container fluid v-if="currentHistory">
            <v-data-table
              :headers="historyHeaders"
              :items="currentHistory"
              :loading="loadingHistory"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getExecutionStatusColor(item.status)"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.duration="{ item }">
                {{ formatDuration(item.duration) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  @click="viewExecution(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="retryExecution(item)"
                  :disabled="item.status !== 'Erreur'"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialogue Détails Exécution -->
    <v-dialog
      v-model="showExecutionDetails"
      max-width="800px"
    >
      <v-card v-if="currentExecution">
        <v-card-title>
          Détails de l'exécution
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="showExecutionDetails = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-alert
                :color="getExecutionStatusColor(currentExecution.status)"
                dark
              >
                Status: {{ currentExecution.status }}
              </v-alert>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Début</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(currentExecution.startTime) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Durée</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDuration(currentExecution.duration) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="6">
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Opérations</v-list-item-title>
                    <v-list-item-subtitle>{{ currentExecution.operations }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Transfert de données</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDataTransfer(currentExecution.dataTransfer) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <v-row v-if="currentExecution.error">
            <v-col cols="12">
              <v-alert
                type="error"
                outlined
              >
                {{ currentExecution.error }}
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useAutomationStore } from '@/stores/automation'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'MakeIntegrationPanel',

  props: {
    scenarios: {
      type: Array,
      required: true
    }
  },

  setup(props, { emit }) {
    const automationStore = useAutomationStore()
    const { showToast } = useToast()

    const loading = ref(false)
    const loadingHistory = ref(false)
    const search = ref('')
    const showHistory = ref(false)
    const showExecutionDetails = ref(false)
    const currentHistory = ref(null)
    const currentExecution = ref(null)

    const scenarioHeaders = [
      { text: 'Nom', value: 'name' },
      { text: 'Status', value: 'status' },
      { text: 'Dernière exécution', value: 'lastRun' },
      { text: 'Fréquence', value: 'frequency' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]

    const historyHeaders = [
      { text: 'Date', value: 'startTime' },
      { text: 'Status', value: 'status' },
      { text: 'Durée', value: 'duration' },
      { text: 'Opérations', value: 'operations' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]

    const refreshData = async () => {
      loading.value = true
      try {
        emit('refresh')
      } catch (error) {
        showToast('Erreur lors du rafraîchissement des scénarios', 'error')
      } finally {
        loading.value = false
      }
    }

    const executeScenario = async (scenario: any) => {
      try {
        await automationStore.executeMakeScenario(scenario.id)
        showToast('Scénario lancé avec succès', 'success')
        refreshData()
      } catch (error) {
        showToast('Erreur lors du lancement du scénario', 'error')
      }
    }

    const viewScenario = (scenario: any) => {
      window.open(`https://make.com/scenario/${scenario.id}`, '_blank')
    }

    const toggleScenario = async (scenario: any) => {
      try {
        await automationStore.toggleMakeScenario(scenario.id)
        showToast(`Scénario ${scenario.isActive ? 'désactivé' : 'activé'} avec succès`, 'success')
        refreshData()
      } catch (error) {
        showToast('Erreur lors de la modification du scénario', 'error')
      }
    }

    const showHistoryDialog = async (scenario: any) => {
      loadingHistory.value = true
      try {
        currentHistory.value = await automationStore.getMakeScenarioHistory(scenario.id)
        showHistory.value = true
      } catch (error) {
        showToast('Erreur lors de la récupération de l\'historique', 'error')
      } finally {
        loadingHistory.value = false
      }
    }

    const viewExecution = (execution: any) => {
      currentExecution.value = execution
      showExecutionDetails.value = true
    }

    const retryExecution = async (execution: any) => {
      try {
        await automationStore.retryMakeExecution(execution.id)
        showToast('Exécution relancée avec succès', 'success')
        showHistoryDialog({ id: execution.scenarioId })
      } catch (error) {
        showToast('Erreur lors de la relance de l\'exécution', 'error')
      }
    }

    const exportHistory = async () => {
      try {
        await automationStore.exportMakeHistory(currentHistory.value)
        showToast('Historique exporté avec succès', 'success')
      } catch (error) {
        showToast('Erreur lors de l\'export de l\'historique', 'error')
      }
    }

    const getStatusColor = (status: string) => {
      const colors = {
        'Actif': 'success',
        'Inactif': 'grey',
        'En cours': 'info',
        'Erreur': 'error'
      }
      return colors[status] || 'grey'
    }

    const getLastRunColor = (status: string) => {
      const colors = {
        'Succès': 'success',
        'Erreur': 'error',
        'En cours': 'info'
      }
      return colors[status] || 'grey'
    }

    const getExecutionStatusColor = (status: string) => {
      const colors = {
        'Succès': 'success',
        'Erreur': 'error',
        'En cours': 'info',
        'Annulé': 'warning'
      }
      return colors[status] || 'grey'
    }

    const formatDate = (date: string) => {
      return new Date(date).toLocaleString()
    }

    const formatDuration = (duration: number) => {
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return `${minutes}m ${seconds}s`
    }

    const formatDataTransfer = (bytes: number) => {
      const sizes = ['B', 'KB', 'MB', 'GB']
      let i = 0
      while (bytes >= 1024 && i < sizes.length - 1) {
        bytes /= 1024
        i++
      }
      return `${bytes.toFixed(2)} ${sizes[i]}`
    }

    onMounted(() => {
      refreshData()
    })

    return {
      loading,
      loadingHistory,
      search,
      showHistory,
      showExecutionDetails,
      currentHistory,
      currentExecution,
      scenarioHeaders,
      historyHeaders,
      refreshData,
      executeScenario,
      viewScenario,
      toggleScenario,
      showHistoryDialog,
      viewExecution,
      retryExecution,
      exportHistory,
      getStatusColor,
      getLastRunColor,
      getExecutionStatusColor,
      formatDate,
      formatDuration,
      formatDataTransfer
    }
  }
})
</script>

<style scoped>
.make-integration-panel {
  padding: 16px;
}
</style> 