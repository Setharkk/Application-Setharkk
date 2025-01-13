<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center">
        Historique des sauvegardes
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          @click="refreshBackups"
          :loading="loading"
        >
          Rafraîchir
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Statistiques globales -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 mb-1">{{ backupStats.count }}</div>
                <div class="text-caption">Sauvegardes totales</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 mb-1">{{ formatBytes(backupStats.totalSize) }}</div>
                <div class="text-caption">Espace utilisé</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 mb-1">{{ formatDate(backupStats.oldestBackup) }}</div>
                <div class="text-caption">Plus ancienne sauvegarde</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <div class="text-h5 mb-1">{{ formatDate(backupStats.newestBackup) }}</div>
                <div class="text-caption">Dernière sauvegarde</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Liste des sauvegardes -->
        <v-data-table
          :headers="headers"
          :items="backupStats.backups"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.date="{ item }">
            {{ formatDate(item.raw.date) }}
          </template>

          <template v-slot:item.size="{ item }">
            {{ formatBytes(item.raw.size) }}
          </template>

          <template v-slot:item.compressed="{ item }">
            <v-icon :color="item.raw.compressed ? 'success' : 'warning'">
              {{ item.raw.compressed ? 'mdi-zip-box' : 'mdi-zip-box-outline' }}
            </v-icon>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-download"
              size="small"
              color="primary"
              class="mr-2"
              @click="downloadBackup(item.raw)"
            />
            <v-btn
              icon="mdi-restore"
              size="small"
              color="warning"
              class="mr-2"
              @click="restoreBackup(item.raw)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              @click="deleteBackup(item.raw)"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog de confirmation de restauration -->
    <v-dialog v-model="restoreDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la restauration</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir restaurer la sauvegarde du {{ formatDate(selectedBackup?.date) }} ?
          Cette action remplacera toutes les données actuelles.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="text"
            @click="restoreDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="restoring"
            @click="confirmRestore"
          >
            Restaurer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmation de suppression -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer la sauvegarde du {{ formatDate(selectedBackup?.date) }} ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="text"
            @click="deleteDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="deleting"
            @click="confirmDelete"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const store = useStore()
const loading = ref(false)
const restoring = ref(false)
const deleting = ref(false)
const restoreDialog = ref(false)
const deleteDialog = ref(false)
const selectedBackup = ref(null)

const backupStats = ref({
  count: 0,
  totalSize: 0,
  oldestBackup: null,
  newestBackup: null,
  backups: []
})

const headers = [
  { title: 'Nom', key: 'name' },
  { title: 'Date', key: 'date' },
  { title: 'Taille', key: 'size' },
  { title: 'Compressé', key: 'compressed' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const refreshBackups = async () => {
  loading.value = true
  try {
    const stats = await store.dispatch('admin/getBackupStats')
    backupStats.value = stats
  } catch (error) {
    console.error('Erreur lors du chargement des sauvegardes:', error)
  } finally {
    loading.value = false
  }
}

const downloadBackup = async (backup) => {
  try {
    const response = await fetch(`/api/admin/backup/download/${backup.name}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backup.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const restoreBackup = (backup) => {
  selectedBackup.value = backup
  restoreDialog.value = true
}

const confirmRestore = async () => {
  if (!selectedBackup.value) return

  restoring.value = true
  try {
    await store.dispatch('admin/restoreBackup', selectedBackup.value.name)
    store.dispatch('notifications/addNotification', {
      type: 'success',
      message: 'Sauvegarde restaurée avec succès'
    })
  } catch (error) {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: 'Erreur lors de la restauration'
    })
  } finally {
    restoring.value = false
    restoreDialog.value = false
  }
}

const deleteBackup = (backup) => {
  selectedBackup.value = backup
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedBackup.value) return

  deleting.value = true
  try {
    await store.dispatch('admin/deleteBackup', selectedBackup.value.name)
    await refreshBackups()
    store.dispatch('notifications/addNotification', {
      type: 'success',
      message: 'Sauvegarde supprimée avec succès'
    })
  } catch (error) {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: 'Erreur lors de la suppression'
    })
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr })
}

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

onMounted(() => {
  refreshBackups()
})
</script>

<style scoped>
.v-data-table {
  border-radius: 4px;
}

.backup-stats {
  background-color: var(--v-surface-variant);
  border-radius: 4px;
  padding: 16px;
}
</style> 