<template>
  <div class="boost-space-panel">
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

    <!-- Projets -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Projets
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="showCreateProjectDialog = true"
            >
              Nouveau Projet
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="projectHeaders"
              :items="projects"
              :loading="loading"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  @click="openProject(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="editProject(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tâches -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Tâches
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="showCreateTaskDialog = true"
            >
              Nouvelle Tâche
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="taskHeaders"
              :items="tasks"
              :loading="loading"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  small
                >
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:item.priority="{ item }">
                <v-chip
                  :color="getPriorityColor(item.priority)"
                  small
                >
                  {{ item.priority }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  @click="editTask(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  @click="deleteTask(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogue Création Projet -->
    <v-dialog
      v-model="showCreateProjectDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>Nouveau Projet</v-card-title>
        <v-card-text>
          <v-form ref="projectForm">
            <v-text-field
              v-model="newProject.name"
              label="Nom du projet"
              required
            ></v-text-field>
            <v-textarea
              v-model="newProject.description"
              label="Description"
            ></v-textarea>
            <v-select
              v-model="newProject.type"
              :items="projectTypes"
              label="Type de projet"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            text
            @click="showCreateProjectDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            @click="createProject"
            :loading="creating"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialogue Création Tâche -->
    <v-dialog
      v-model="showCreateTaskDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>Nouvelle Tâche</v-card-title>
        <v-card-text>
          <v-form ref="taskForm">
            <v-text-field
              v-model="newTask.title"
              label="Titre de la tâche"
              required
            ></v-text-field>
            <v-textarea
              v-model="newTask.description"
              label="Description"
            ></v-textarea>
            <v-select
              v-model="newTask.projectId"
              :items="projects"
              item-text="name"
              item-value="id"
              label="Projet"
              required
            ></v-select>
            <v-select
              v-model="newTask.priority"
              :items="priorities"
              label="Priorité"
              required
            ></v-select>
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="newTask.dueDate"
                  label="Date d'échéance"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="newTask.dueDate"
                no-title
                @input="dateMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            text
            @click="showCreateTaskDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            @click="createTask"
            :loading="creating"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useAutomationStore } from '@/stores/automation'
import { useToast } from '@/composables/useToast'

export default defineComponent({
  name: 'BoostSpacePanel',

  props: {
    projects: {
      type: Array,
      required: true
    },
    tasks: {
      type: Array,
      required: true
    }
  },

  setup(props, { emit }) {
    const automationStore = useAutomationStore()
    const { showToast } = useToast()

    const loading = ref(false)
    const creating = ref(false)
    const showCreateProjectDialog = ref(false)
    const showCreateTaskDialog = ref(false)
    const dateMenu = ref(false)

    const projectHeaders = [
      { text: 'Nom', value: 'name' },
      { text: 'Description', value: 'description' },
      { text: 'Type', value: 'type' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]

    const taskHeaders = [
      { text: 'Titre', value: 'title' },
      { text: 'Projet', value: 'projectName' },
      { text: 'Statut', value: 'status' },
      { text: 'Priorité', value: 'priority' },
      { text: 'Date d\'échéance', value: 'dueDate' },
      { text: 'Actions', value: 'actions', sortable: false }
    ]

    const projectTypes = [
      'Marketing',
      'Développement',
      'Design',
      'Contenu',
      'Autre'
    ]

    const priorities = [
      'Basse',
      'Moyenne',
      'Haute',
      'Urgente'
    ]

    const newProject = ref({
      name: '',
      description: '',
      type: ''
    })

    const newTask = ref({
      title: '',
      description: '',
      projectId: '',
      priority: 'Moyenne',
      dueDate: null
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

    const createProject = async () => {
      creating.value = true
      try {
        await automationStore.createBoostSpaceProject(newProject.value)
        showToast('Projet créé avec succès', 'success')
        showCreateProjectDialog.value = false
        refreshData()
      } catch (error) {
        showToast('Erreur lors de la création du projet', 'error')
      } finally {
        creating.value = false
      }
    }

    const createTask = async () => {
      creating.value = true
      try {
        await automationStore.createBoostSpaceTask(newTask.value)
        showToast('Tâche créée avec succès', 'success')
        showCreateTaskDialog.value = false
        refreshData()
      } catch (error) {
        showToast('Erreur lors de la création de la tâche', 'error')
      } finally {
        creating.value = false
      }
    }

    const getStatusColor = (status: string) => {
      const colors = {
        'À faire': 'grey',
        'En cours': 'blue',
        'En révision': 'orange',
        'Terminé': 'green'
      }
      return colors[status] || 'grey'
    }

    const getPriorityColor = (priority: string) => {
      const colors = {
        'Basse': 'green',
        'Moyenne': 'blue',
        'Haute': 'orange',
        'Urgente': 'red'
      }
      return colors[priority] || 'grey'
    }

    const openProject = (project: any) => {
      window.open(`https://app.boost.space/project/${project.id}`, '_blank')
    }

    const editProject = (project: any) => {
      // Implémenter la logique d'édition
    }

    const editTask = (task: any) => {
      // Implémenter la logique d'édition
    }

    const deleteTask = async (task: any) => {
      try {
        await automationStore.deleteBoostSpaceTask(task.id)
        showToast('Tâche supprimée avec succès', 'success')
        refreshData()
      } catch (error) {
        showToast('Erreur lors de la suppression de la tâche', 'error')
      }
    }

    onMounted(() => {
      refreshData()
    })

    return {
      loading,
      creating,
      showCreateProjectDialog,
      showCreateTaskDialog,
      dateMenu,
      projectHeaders,
      taskHeaders,
      projectTypes,
      priorities,
      newProject,
      newTask,
      refreshData,
      createProject,
      createTask,
      getStatusColor,
      getPriorityColor,
      openProject,
      editProject,
      editTask,
      deleteTask
    }
  }
})
</script>

<style scoped>
.boost-space-panel {
  padding: 16px;
}
</style> 