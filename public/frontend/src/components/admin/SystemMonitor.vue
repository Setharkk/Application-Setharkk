<template>
  <v-container>
    <!-- Statut des services -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Statut des services
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              @click="refreshServices"
              :loading="loading"
            >
              Rafraîchir
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="service in services" :key="service.id">
                <template v-slot:prepend>
                  <v-icon :color="getStatusColor(service.status)">
                    {{ getStatusIcon(service.status) }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ service.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ service.description }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn-group>
                    <v-btn
                      :color="service.status === 'running' ? 'error' : 'success'"
                      size="small"
                      @click="toggleService(service)"
                    >
                      {{ service.status === 'running' ? 'Arrêter' : 'Démarrer' }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      size="small"
                      @click="showLogs(service)"
                    >
                      Logs
                    </v-btn>
                  </v-btn-group>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ressources système -->
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>CPU</v-card-title>
          <v-card-text class="text-center">
            <v-progress-circular
              :model-value="systemResources.cpu"
              color="primary"
              size="100"
              width="10"
            >
              {{ systemResources.cpu }}%
            </v-progress-circular>
            <div class="mt-2">
              {{ systemResources.cpuDetails }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Mémoire</v-card-title>
          <v-card-text class="text-center">
            <v-progress-circular
              :model-value="systemResources.memory.percentage"
              color="info"
              size="100"
              width="10"
            >
              {{ systemResources.memory.percentage }}%
            </v-progress-circular>
            <div class="mt-2">
              {{ formatBytes(systemResources.memory.used) }} / 
              {{ formatBytes(systemResources.memory.total) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Disque</v-card-title>
          <v-card-text class="text-center">
            <v-progress-circular
              :model-value="systemResources.disk.percentage"
              color="warning"
              size="100"
              width="10"
            >
              {{ systemResources.disk.percentage }}%
            </v-progress-circular>
            <div class="mt-2">
              {{ formatBytes(systemResources.disk.used) }} / 
              {{ formatBytes(systemResources.disk.total) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Logs système -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Logs système
            <v-spacer />
            <v-btn-group>
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                @click="refreshLogs"
                :loading="logsLoading"
              >
                Rafraîchir
              </v-btn>
              <v-btn
                color="error"
                prepend-icon="mdi-delete"
                @click="clearLogs"
              >
                Nettoyer
              </v-btn>
            </v-btn-group>
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedLogLevel"
              :items="logLevels"
              label="Niveau de log"
              class="mb-4"
            />
            <div class="logs-container">
              <div
                v-for="(log, index) in filteredLogs"
                :key="index"
                :class="['log-entry', `log-${log.level}`]"
              >
                <span class="log-timestamp">{{ formatDate(log.timestamp) }}</span>
                <span class="log-level">{{ log.level.toUpperCase() }}</span>
                <span class="log-service">{{ log.service }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog des logs de service -->
    <v-dialog v-model="logsDialog" fullscreen hide-overlay>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="logsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Logs - {{ selectedService?.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            variant="text"
            @click="downloadServiceLogs"
          >
            Télécharger
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <div class="logs-container service-logs">
            <div
              v-for="(log, index) in serviceLogs"
              :key="index"
              :class="['log-entry', `log-${log.level}`]"
            >
              <span class="log-timestamp">{{ formatDate(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const loading = ref(false)
const logsLoading = ref(false)
const logsDialog = ref(false)
const selectedService = ref(null)
const selectedLogLevel = ref('all')
const serviceLogs = ref([])

// État du système
const services = ref([])
const systemResources = ref({
  cpu: 0,
  cpuDetails: '',
  memory: {
    used: 0,
    total: 0,
    percentage: 0
  },
  disk: {
    used: 0,
    total: 0,
    percentage: 0
  }
})

const systemLogs = ref([])

// Options
const logLevels = [
  { title: 'Tous', value: 'all' },
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warning' },
  { title: 'Error', value: 'error' }
]

// Computed
const filteredLogs = computed(() => {
  if (selectedLogLevel.value === 'all') {
    return systemLogs.value
  }
  return systemLogs.value.filter(log => log.level === selectedLogLevel.value)
})

// Méthodes
const refreshServices = async () => {
  loading.value = true
  try {
    services.value = await store.dispatch('admin/fetchServices')
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des services:', error)
  } finally {
    loading.value = false
  }
}

const toggleService = async (service) => {
  try {
    await store.dispatch('admin/toggleService', {
      serviceId: service.id,
      action: service.status === 'running' ? 'stop' : 'start'
    })
    await refreshServices()
  } catch (error) {
    console.error('Erreur lors du changement de statut du service:', error)
  }
}

const showLogs = async (service) => {
  selectedService.value = service
  logsDialog.value = true
  try {
    serviceLogs.value = await store.dispatch('admin/fetchServiceLogs', service.id)
  } catch (error) {
    console.error('Erreur lors du chargement des logs:', error)
  }
}

const refreshLogs = async () => {
  logsLoading.value = true
  try {
    systemLogs.value = await store.dispatch('admin/fetchSystemLogs')
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des logs:', error)
  } finally {
    logsLoading.value = false
  }
}

const clearLogs = async () => {
  try {
    await store.dispatch('admin/clearSystemLogs')
    await refreshLogs()
  } catch (error) {
    console.error('Erreur lors du nettoyage des logs:', error)
  }
}

const downloadServiceLogs = () => {
  if (!selectedService.value) return

  const logsText = serviceLogs.value
    .map(log => `${formatDate(log.timestamp)} [${log.level}] ${log.message}`)
    .join('\n')

  const blob = new Blob([logsText], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedService.value.name}_logs_${new Date().toISOString()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const formatBytes = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

const getStatusColor = (status: string) => {
  const colors = {
    running: 'success',
    stopped: 'error',
    error: 'error',
    warning: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons = {
    running: 'mdi-check-circle',
    stopped: 'mdi-stop-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert'
  }
  return icons[status] || 'mdi-help-circle'
}

// Monitoring en temps réel
let monitoringInterval: number

const startMonitoring = () => {
  monitoringInterval = setInterval(async () => {
    try {
      const resources = await store.dispatch('admin/fetchSystemResources')
      systemResources.value = resources
    } catch (error) {
      console.error('Erreur lors de la mise à jour des ressources:', error)
    }
  }, 5000) // Mise à jour toutes les 5 secondes
}

// Lifecycle hooks
onMounted(() => {
  refreshServices()
  refreshLogs()
  startMonitoring()
})

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
})
</script>

<style scoped>
.logs-container {
  height: 400px;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #fff;
  padding: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.service-logs {
  height: calc(100vh - 200px);
}

.log-entry {
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.log-timestamp {
  color: #888;
  margin-right: 1rem;
}

.log-level {
  font-weight: bold;
  margin-right: 1rem;
}

.log-service {
  color: #64B5F6;
  margin-right: 1rem;
}

.log-message {
  color: #fff;
}

.log-info {
  color: #64B5F6;
}

.log-warning {
  color: #FFB74D;
}

.log-error {
  color: #E57373;
}
</style> 