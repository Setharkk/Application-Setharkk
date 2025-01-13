<template>
  <v-container>
    <!-- En-tête -->
    <v-row class="mb-4">
      <v-col cols="8">
        <h2 class="text-h4">Automatisation Marketing</h2>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="createWorkflow"
        >
          Nouveau workflow
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

    <!-- Liste des workflows -->
    <v-row>
      <v-col
        v-for="workflow in workflows"
        :key="workflow.id"
        cols="12"
        md="6"
      >
        <v-card
          :class="{ 'workflow-active': workflow.active }"
          @click="selectWorkflow(workflow)"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <h3 class="text-h6">{{ workflow.name }}</h3>
                <p class="text-subtitle-2 text-medium-emphasis">
                  {{ workflow.description }}
                </p>
              </div>
              <v-switch
                v-model="workflow.active"
                color="primary"
                hide-details
                @click.stop
                @change="toggleWorkflow(workflow)"
              />
            </div>

            <v-divider class="my-3" />

            <div class="d-flex align-center mt-2">
              <v-icon
                :icon="getTriggerIcon(workflow.trigger.type)"
                class="mr-2"
              />
              <span>{{ getTriggerLabel(workflow.trigger.type) }}</span>
              <v-icon class="mx-2">mdi-arrow-right</v-icon>
              <v-icon
                :icon="getActionIcon(workflow.action.type)"
                class="mr-2"
              />
              <span>{{ getActionLabel(workflow.action.type) }}</span>
            </div>

            <div class="mt-4">
              <v-chip
                :color="getStatusColor(workflow.status)"
                size="small"
                class="mr-2"
              >
                {{ workflow.status }}
              </v-chip>
              <v-chip
                size="small"
                class="mr-2"
              >
                {{ workflow.executionCount }} exécutions
              </v-chip>
              <v-chip
                v-if="workflow.lastRun"
                size="small"
              >
                Dernière exécution : {{ formatDate(workflow.lastRun) }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              @click.stop="editWorkflow(workflow)"
            >
              Modifier
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              @click.stop="confirmDelete(workflow)"
            >
              Supprimer
            </v-btn>
          </v-card-actions>
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
          {{ selectedWorkflow ? 'Modifier le workflow' : 'Nouveau workflow' }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="formData.name"
              label="Nom du workflow"
              required
            />

            <v-textarea
              v-model="formData.description"
              label="Description"
              rows="3"
            />

            <v-select
              v-model="formData.trigger.type"
              :items="triggers"
              label="Déclencheur"
              item-title="label"
              item-value="type"
              required
            />

            <v-select
              v-model="formData.action.type"
              :items="actions"
              label="Action"
              item-title="label"
              item-value="type"
              required
            />

            <v-switch
              v-model="formData.active"
              label="Activer le workflow"
              color="primary"
            />
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
            {{ selectedWorkflow ? 'Modifier' : 'Créer' }}
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
          Êtes-vous sûr de vouloir supprimer ce workflow ?
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
            @click="deleteWorkflow"
            :loading="loading"
          >
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Templates de campagne -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Modèles de campagne</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="template in campaignTemplates" :key="template.id" cols="12" md="4">
                <v-card outlined>
                  <v-card-title>{{ template.name }}</v-card-title>
                  <v-card-text>
                    <p>{{ template.description }}</p>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="applyTemplate(template.id)">
                      Utiliser ce modèle
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Triggers personnalisés -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Triggers personnalisés</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="trigger in customTriggers" :key="trigger.id" cols="12" md="4">
                <v-card outlined>
                  <v-card-title>{{ trigger.name }}</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item v-for="condition in trigger.conditions" :key="condition">
                        {{ condition }}
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Règles de segmentation -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Segmentation</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="rule in segmentationRules" :key="rule.id" cols="12" md="4">
                <v-card outlined>
                  <v-card-title>{{ rule.name }}</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item v-for="condition in rule.conditions" :key="condition">
                        {{ condition }}
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const dialog = ref(false)
const deleteDialog = ref(false)
const workflowToDelete = ref(null)

const formData = ref({
  name: '',
  description: '',
  trigger: {
    type: ''
  },
  action: {
    type: ''
  },
  active: true
})

// Données du store
const workflows = computed(() => store.getters['marketingAutomation/getWorkflows'])
const triggers = computed(() => store.getters['marketingAutomation/getTriggers'])
const actions = computed(() => store.getters['marketingAutomation/getActions'])
const selectedWorkflow = computed(() => store.getters['marketingAutomation/getSelectedWorkflow'])
const loading = computed(() => store.getters['marketingAutomation/isLoading'])
const error = computed(() => store.getters['marketingAutomation/getError'])

// Méthodes
const createWorkflow = () => {
  formData.value = {
    name: '',
    description: '',
    trigger: { type: '' },
    action: { type: '' },
    active: true
  }
  dialog.value = true
}

const editWorkflow = (workflow) => {
  formData.value = {
    name: workflow.name,
    description: workflow.description,
    trigger: { ...workflow.trigger },
    action: { ...workflow.action },
    active: workflow.active
  }
  store.dispatch('marketingAutomation/selectWorkflow', workflow)
  dialog.value = true
}

const handleSubmit = async () => {
  try {
    if (selectedWorkflow.value) {
      await store.dispatch('marketingAutomation/updateWorkflow', {
        id: selectedWorkflow.value.id,
        data: formData.value
      })
    } else {
      await store.dispatch('marketingAutomation/createWorkflow', formData.value)
    }
    dialog.value = false
    store.dispatch('marketingAutomation/selectWorkflow', null)
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
  }
}

const confirmDelete = (workflow) => {
  workflowToDelete.value = workflow
  deleteDialog.value = true
}

const deleteWorkflow = async () => {
  if (workflowToDelete.value) {
    await store.dispatch('marketingAutomation/deleteWorkflow', workflowToDelete.value.id)
    deleteDialog.value = false
    workflowToDelete.value = null
  }
}

const toggleWorkflow = async (workflow) => {
  try {
    await store.dispatch('marketingAutomation/updateWorkflow', {
      id: workflow.id,
      data: { ...workflow, active: !workflow.active }
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

const getTriggerIcon = (type) => {
  const icons = {
    form: 'mdi-form-select',
    time: 'mdi-clock-outline',
    event: 'mdi-lightning-bolt',
    api: 'mdi-api'
  }
  return icons[type] || 'mdi-help'
}

const getActionIcon = (type) => {
  const icons = {
    email: 'mdi-email',
    notification: 'mdi-bell',
    webhook: 'mdi-webhook',
    api: 'mdi-api'
  }
  return icons[type] || 'mdi-help'
}

const getTriggerLabel = (type) => {
  const trigger = triggers.value.find(t => t.type === type)
  return trigger ? trigger.label : type
}

const getActionLabel = (type) => {
  const action = actions.value.find(a => a.type === type)
  return action ? action.label : type
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'grey',
    error: 'error',
    running: 'info'
  }
  return colors[status] || 'grey'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR')
}

const clearError = () => {
  store.dispatch('marketingAutomation/clearError')
}

// Modèles de campagne prédéfinis
const campaignTemplates = ref([
  {
    id: 1,
    name: 'Welcome Series',
    description: 'Série d\'emails de bienvenue pour les nouveaux clients',
    steps: [
      { type: 'email', delay: '0d', template: 'welcome_1' },
      { type: 'wait', delay: '2d' },
      { type: 'email', delay: '3d', template: 'welcome_2' },
      { type: 'condition', criteria: 'opened_email', template: 'welcome_2' }
    ]
  },
  {
    id: 2,
    name: 'Abandoned Cart',
    description: 'Récupération des paniers abandonnés',
    steps: [
      { type: 'trigger', event: 'cart_abandoned' },
      { type: 'wait', delay: '1h' },
      { type: 'email', template: 'cart_reminder_1' },
      { type: 'condition', criteria: 'cart_recovered' }
    ]
  }
])

// Triggers personnalisés
const customTriggers = ref([
  {
    id: 'page_visit',
    name: 'Visite de page',
    conditions: ['url', 'visit_count', 'time_on_page']
  },
  {
    id: 'form_submit',
    name: 'Soumission de formulaire',
    conditions: ['form_id', 'form_data']
  },
  {
    id: 'custom_event',
    name: 'Événement personnalisé',
    conditions: ['event_name', 'event_data']
  }
])

// Règles de segmentation
const segmentationRules = ref([
  {
    id: 'behavior',
    name: 'Comportement',
    conditions: ['pages_visited', 'products_viewed', 'time_on_site']
  },
  {
    id: 'demographics',
    name: 'Démographie',
    conditions: ['age', 'location', 'language']
  }
])

// Fonctions de gestion des triggers
const addCustomTrigger = (workflowId: string, trigger: any) => {
  // Logique d'ajout de trigger
}

const updateTriggerConditions = (triggerId: string, conditions: any[]) => {
  // Logique de mise à jour des conditions
}

// Fonctions de gestion des modèles
const applyTemplate = (templateId: number) => {
  // Logique d'application du modèle
}

const saveAsTemplate = (workflow: any) => {
  // Logique de sauvegarde comme modèle
}

// Fonctions de segmentation
const applySegmentation = (ruleId: string, workflow: any) => {
  // Logique d'application des règles de segmentation
}

// Chargement initial des données
onMounted(() => {
  store.dispatch('marketingAutomation/fetchWorkflows')
  store.dispatch('marketingAutomation/fetchTriggers')
  store.dispatch('marketingAutomation/fetchActions')
})
</script>

<style scoped>
.workflow-active {
  border-left: 4px solid var(--v-primary-base);
}

.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style> 