<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">
            Tableau de bord d'automatisation
          </v-card-title>
          
          <!-- Make.com Integration -->
          <v-card class="ma-4">
            <v-card-title>Make.com</v-card-title>
            <v-card-text>
              <make-integration-panel 
                v-if="isMakeEnabled"
                :scenarios="makeScenarios"
                @refresh="fetchMakeScenarios"
                @execute="executeMakeScenario"
              />
            </v-card-text>
          </v-card>

          <!-- Boost.space Integration -->
          <v-card class="ma-4">
            <v-card-title>Boost.space</v-card-title>
            <v-card-text>
              <boost-space-panel 
                v-if="isBoostSpaceEnabled"
                :projects="boostSpaceProjects"
                :tasks="boostSpaceTasks"
                @refresh="fetchBoostSpaceData"
                @create-task="createBoostSpaceTask"
              />
            </v-card-text>
          </v-card>

          <!-- Afforai Integration -->
          <v-card class="ma-4">
            <v-card-title>Afforai</v-card-title>
            <v-card-text>
              <afforai-panel 
                v-if="isAfforaiEnabled"
                :documents="afforaiDocuments"
                :analyses="afforaiAnalyses"
                @refresh="fetchAfforaiData"
                @analyze="analyzeWithAfforai"
              />
            </v-card-text>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import MakeIntegrationPanel from './MakeIntegrationPanel.vue'
import BoostSpacePanel from './BoostSpacePanel.vue'
import AfforaiPanel from './AfforaiPanel.vue'
import { useAutomationStore } from '@/stores/automation'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'AutomationDashboard',
  
  components: {
    MakeIntegrationPanel,
    BoostSpacePanel,
    AfforaiPanel
  },

  setup() {
    const automationStore = useAutomationStore()
    const { showToast } = useToast()

    const makeScenarios = ref([])
    const boostSpaceProjects = ref([])
    const boostSpaceTasks = ref([])
    const afforaiDocuments = ref([])
    const afforaiAnalyses = ref([])

    const isMakeEnabled = ref(import.meta.env.VITE_MAKE_ENABLED === 'true')
    const isBoostSpaceEnabled = ref(import.meta.env.VITE_BOOST_SPACE_ENABLED === 'true')
    const isAfforaiEnabled = ref(import.meta.env.VITE_AFFORAI_ENABLED === 'true')

    const fetchMakeScenarios = async () => {
      try {
        makeScenarios.value = await automationStore.fetchMakeScenarios()
      } catch (error) {
        showToast('Erreur lors de la récupération des scénarios Make', 'error')
      }
    }

    const executeMakeScenario = async (scenarioId: string) => {
      try {
        await automationStore.executeMakeScenario(scenarioId)
        showToast('Scénario Make exécuté avec succès', 'success')
      } catch (error) {
        showToast('Erreur lors de l\'exécution du scénario Make', 'error')
      }
    }

    const fetchBoostSpaceData = async () => {
      try {
        const data = await automationStore.fetchBoostSpaceData()
        boostSpaceProjects.value = data.projects
        boostSpaceTasks.value = data.tasks
      } catch (error) {
        showToast('Erreur lors de la récupération des données Boost.space', 'error')
      }
    }

    const createBoostSpaceTask = async (taskData: any) => {
      try {
        await automationStore.createBoostSpaceTask(taskData)
        showToast('Tâche Boost.space créée avec succès', 'success')
        await fetchBoostSpaceData()
      } catch (error) {
        showToast('Erreur lors de la création de la tâche Boost.space', 'error')
      }
    }

    const fetchAfforaiData = async () => {
      try {
        const data = await automationStore.fetchAfforaiData()
        afforaiDocuments.value = data.documents
        afforaiAnalyses.value = data.analyses
      } catch (error) {
        showToast('Erreur lors de la récupération des données Afforai', 'error')
      }
    }

    const analyzeWithAfforai = async (documentId: string) => {
      try {
        await automationStore.analyzeWithAfforai(documentId)
        showToast('Analyse Afforai lancée avec succès', 'success')
        await fetchAfforaiData()
      } catch (error) {
        showToast('Erreur lors de l\'analyse Afforai', 'error')
      }
    }

    onMounted(async () => {
      if (isMakeEnabled.value) await fetchMakeScenarios()
      if (isBoostSpaceEnabled.value) await fetchBoostSpaceData()
      if (isAfforaiEnabled.value) await fetchAfforaiData()
    })

    return {
      makeScenarios,
      boostSpaceProjects,
      boostSpaceTasks,
      afforaiDocuments,
      afforaiAnalyses,
      isMakeEnabled,
      isBoostSpaceEnabled,
      isAfforaiEnabled,
      fetchMakeScenarios,
      executeMakeScenario,
      fetchBoostSpaceData,
      createBoostSpaceTask,
      fetchAfforaiData,
      analyzeWithAfforai
    }
  }
})
</script>

<style scoped>
.headline {
  color: var(--v-primary-base);
  font-weight: 600;
}
</style> 