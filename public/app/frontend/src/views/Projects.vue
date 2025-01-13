<template>
  <div class="projects">
    <div class="projects-header">
      <h1>Projets</h1>
      <button class="btn-primary" @click="showNewProjectModal = true">
        Nouveau Projet
      </button>
    </div>

    <div class="projects-grid">
      <!-- Liste des projets -->
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3>{{ project.name }}</h3>
          <span class="project-status" :class="project.status">
            {{ project.status }}
          </span>
        </div>

        <p class="project-description">{{ project.description }}</p>

        <div class="project-progress">
          <div class="progress-bar">
            <div :style="{ width: project.progress + '%' }" class="progress"></div>
          </div>
          <span class="progress-text">{{ project.progress }}%</span>
        </div>

        <div class="project-meta">
          <div class="deadline">
            <span class="label">Date limite :</span>
            <span class="value">{{ project.deadline }}</span>
          </div>
          <div class="team">
            <span class="label">Équipe :</span>
            <div class="team-avatars">
              <img 
                v-for="member in project.team" 
                :key="member.id"
                :src="member.avatar"
                :alt="member.name"
                :title="member.name"
                class="avatar"
              >
            </div>
          </div>
        </div>

        <div class="project-actions">
          <button class="btn-secondary" @click="openProjectDetails(project.id)">
            Détails
          </button>
          <button class="btn-outline" @click="openProjectSettings(project.id)">
            Paramètres
          </button>
        </div>
      </div>
    </div>

    <!-- Modal pour nouveau projet -->
    <div v-if="showNewProjectModal" class="modal">
      <div class="modal-content">
        <h2>Nouveau Projet</h2>
        <form @submit.prevent="createProject">
          <div class="form-group">
            <label>Nom du projet</label>
            <input v-model="newProject.name" type="text" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProject.description" required></textarea>
          </div>
          <div class="form-group">
            <label>Date limite</label>
            <input v-model="newProject.deadline" type="date" required>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="showNewProjectModal = false">
              Annuler
            </button>
            <button type="submit" class="btn-primary">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

interface Project {
  id: number
  name: string
  description: string
  status: string
  progress: number
  deadline: string
  team: Array<{
    id: number
    name: string
    avatar: string
  }>
}

interface NewProject {
  name: string
  description: string
  deadline: string
}

export default defineComponent({
  name: 'Projects',
  setup() {
    const projects = ref<Project[]>([
      {
        id: 1,
        name: 'Refonte du site web',
        description: 'Modernisation complète du site web avec nouvelles fonctionnalités',
        status: 'en-cours',
        progress: 75,
        deadline: '2024-03-15',
        team: [
          { id: 1, name: 'Alice', avatar: '/avatars/alice.jpg' },
          { id: 2, name: 'Bob', avatar: '/avatars/bob.jpg' }
        ]
      },
      {
        id: 2,
        name: 'Application mobile',
        description: 'Développement d\'une application mobile cross-platform',
        status: 'planifié',
        progress: 30,
        deadline: '2024-06-30',
        team: [
          { id: 3, name: 'Charlie', avatar: '/avatars/charlie.jpg' },
          { id: 4, name: 'David', avatar: '/avatars/david.jpg' }
        ]
      }
    ])

    const showNewProjectModal = ref(false)
    const newProject = ref<NewProject>({
      name: '',
      description: '',
      deadline: ''
    })

    const createProject = () => {
      // Logique pour créer un nouveau projet
      showNewProjectModal.value = false
    }

    const openProjectDetails = (projectId: number) => {
      // Logique pour ouvrir les détails du projet
    }

    const openProjectSettings = (projectId: number) => {
      // Logique pour ouvrir les paramètres du projet
    }

    return {
      projects,
      showNewProjectModal,
      newProject,
      createProject,
      openProjectDetails,
      openProjectSettings
    }
  }
})
</script>

<style scoped>
.projects {
  padding: 20px;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.project-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.project-status.en-cours {
  background: #FFF3CD;
  color: #856404;
}

.project-status.planifié {
  background: #D1ECF1;
  color: #0C5460;
}

.project-description {
  color: #666;
  margin-bottom: 15px;
}

.progress-bar {
  background: #eee;
  height: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.progress {
  background: #4CAF50;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.project-meta {
  margin-top: 15px;
}

.team-avatars {
  display: flex;
  margin-top: 5px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: -10px;
  border: 2px solid white;
}

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 