<template>
  <div class="afforai-panel">
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          @click="refreshData"
          :loading="loading"
          class="mb-4"
        >
          Rafraîchir les données
        </v-btn>
      </v-col>
    </v-row>

    <!-- Documents -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Documents
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="showUploadDialog = true"
            >
              Importer un document
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="documentHeaders"
              :items="documents"
              :loading="loading"
            >
              <template v-slot:item.type="{ item }">
                <v-chip
                  :color="getTypeColor(item.type)"
                  small
                >
                  {{ item.type }}
                </v-chip>
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  @click="analyzeDocument(item)"
                  :disabled="item.status === 'En cours'"
                >
                  <v-icon>mdi-brain</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="viewDocument(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="deleteDocument(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Analyses -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Analyses
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
              :headers="analysisHeaders"
              :items="analyses"
              :loading="loading"
              :search="search"
            >
              <template v-slot:item.confidence="{ item }">
                <v-progress-linear
                  :value="item.confidence * 100"
                  :color="getConfidenceColor(item.confidence)"
                  height="20"
                >
                  <template v-slot:default>
                    {{ Math.round(item.confidence * 100) }}%
                  </template>
                </v-progress-linear>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  @click="viewAnalysis(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="exportAnalysis(item)"
                >
                  <v-icon>mdi-export</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogue Upload Document -->
    <v-dialog
      v-model="showUploadDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>Importer un document</v-card-title>
        <v-card-text>
          <v-form ref="uploadForm">
            <v-file-input
              v-model="uploadFile"
              label="Sélectionner un document"
              accept=".pdf,.doc,.docx,.txt"
              show-size
              truncate-length="50"
              required
            ></v-file-input>
            <v-text-field
              v-model="uploadData.name"
              label="Nom du document"
              required
            ></v-text-field>
            <v-select
              v-model="uploadData.type"
              :items="documentTypes"
              label="Type de document"
              required
            ></v-select>
            <v-textarea
              v-model="uploadData.description"
              label="Description"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            text
            @click="showUploadDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            @click="uploadDocument"
            :loading="uploading"
          >
            Importer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogue Visualisation Analyse -->
    <v-dialog
      v-model="showAnalysisDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn
            icon
            dark
            @click="showAnalysisDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Résultats de l'analyse</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            dark
            text
            @click="exportCurrentAnalysis"
          >
            Exporter
            <v-icon right>mdi-export</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container fluid v-if="currentAnalysis">
            <v-row>
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title>Résumé</v-card-title>
                  <v-card-text>
                    <v-alert
                      :color="getConfidenceColor(currentAnalysis.confidence)"
                      dark
                    >
                      Confiance: {{ Math.round(currentAnalysis.confidence * 100) }}%
                    </v-alert>
                    <div class="mt-4" v-html="currentAnalysis.summary"></div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card outlined>
                  <v-card-title>Points clés</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="(point, index) in currentAnalysis.keyPoints"
                        :key="index"
                      >
                        <v-list-item-icon>
                          <v-icon color="primary">mdi-check-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>{{ point }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
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
  name: 'AfforaiPanel',

  props: {
    documents: {
      type: Array,
      required: true
    },
    analyses: {
      type: Array,
      required: true
    }
  },

  setup(props, { emit }) {
    const automationStore = useAutomationStore()
    const { showToast } = useToast()

    const loading = ref(false)
    const uploading = ref(false)
    const search = ref('')
    const showUploadDialog = ref(false)
    const showAnalysisDialog = ref(false)
    const uploadFile = ref(null)
    const currentAnalysis = ref(null)

    const documentHeaders = [
      { text: 'Nom', value: 'name' },
      { text: 'Type', value: 'type' },
      { text: 'Status', value: 'status' },
      { text: 'Date', value: 'createdAt' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]

    const analysisHeaders = [
      { text: 'Document', value: 'documentName' },
      { text: 'Date', value: 'createdAt' },
      { text: 'Confiance', value: 'confidence' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]

    const documentTypes = [
      'PDF',
      'Word',
      'Text',
      'Article',
      'Rapport'
    ]

    const uploadData = ref({
      name: '',
      type: '',
      description: ''
    })

    const refreshData = async () => {
      loading.value = true
      try {
        emit('refresh')
      } catch (error) {
        showToast('Erreur lors du rafraîchissement des données', 'error')
      } finally {
        loading.value = false
      }
    }

    const uploadDocument = async () => {
      if (!uploadFile.value) {
        showToast('Veuillez sélectionner un fichier', 'error')
        return
      }

      uploading.value = true
      try {
        const formData = new FormData()
        formData.append('file', uploadFile.value)
        formData.append('data', JSON.stringify(uploadData.value))

        await automationStore.uploadAfforaiDocument(formData)
        showToast('Document importé avec succès', 'success')
        showUploadDialog.value = false
        refreshData()
      } catch (error) {
        showToast('Erreur lors de l\'import du document', 'error')
      } finally {
        uploading.value = false
      }
    }

    const analyzeDocument = async (document: any) => {
      try {
        await automationStore.analyzeAfforaiDocument(document.id)
        showToast('Analyse lancée avec succès', 'success')
        refreshData()
      } catch (error) {
        showToast('Erreur lors du lancement de l\'analyse', 'error')
      }
    }

    const viewDocument = (document: any) => {
      window.open(document.url, '_blank')
    }

    const deleteDocument = async (document: any) => {
      try {
        await automationStore.deleteAfforaiDocument(document.id)
        showToast('Document supprimé avec succès', 'success')
        refreshData()
      } catch (error) {
        showToast('Erreur lors de la suppression du document', 'error')
      }
    }

    const viewAnalysis = (analysis: any) => {
      currentAnalysis.value = analysis
      showAnalysisDialog.value = true
    }

    const exportAnalysis = async (analysis: any) => {
      try {
        await automationStore.exportAfforaiAnalysis(analysis.id)
        showToast('Analyse exportée avec succès', 'success')
      } catch (error) {
        showToast('Erreur lors de l\'export de l\'analyse', 'error')
      }
    }

    const exportCurrentAnalysis = () => {
      if (currentAnalysis.value) {
        exportAnalysis(currentAnalysis.value)
      }
    }

    const getTypeColor = (type: string) => {
      const colors = {
        'PDF': 'red',
        'Word': 'blue',
        'Text': 'green',
        'Article': 'purple',
        'Rapport': 'orange'
      }
      return colors[type] || 'grey'
    }

    const getStatusColor = (status: string) => {
      const colors = {
        'En attente': 'grey',
        'En cours': 'blue',
        'Terminé': 'green',
        'Erreur': 'red'
      }
      return colors[status] || 'grey'
    }

    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 0.8) return 'success'
      if (confidence >= 0.6) return 'warning'
      return 'error'
    }

    onMounted(() => {
      refreshData()
    })

    return {
      loading,
      uploading,
      search,
      showUploadDialog,
      showAnalysisDialog,
      uploadFile,
      uploadData,
      currentAnalysis,
      documentHeaders,
      analysisHeaders,
      documentTypes,
      refreshData,
      uploadDocument,
      analyzeDocument,
      viewDocument,
      deleteDocument,
      viewAnalysis,
      exportAnalysis,
      exportCurrentAnalysis,
      getTypeColor,
      getStatusColor,
      getConfidenceColor
    }
  }
})
</script>

<style scoped>
.afforai-panel {
  padding: 16px;
}
</style> 