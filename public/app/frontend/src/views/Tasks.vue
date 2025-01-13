<template>
  <div class="tasks">
    <div class="tasks-header">
      <h1>Tâches</h1>
      <div class="header-actions">
        <div class="filters">
          <select v-model="currentFilter" class="filter-select">
            <option value="all">Toutes les tâches</option>
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminées</option>
          </select>
        </div>
        <button class="btn-primary" @click="showNewTaskModal = true">
          Nouvelle Tâche
        </button>
      </div>
    </div>

    <div class="tasks-board">
      <!-- Colonne En attente -->
      <div class="task-column">
        <h2>En attente</h2>
        <div class="task-list">
          <div 
            v-for="task in pendingTasks" 
            :key="task.id" 
            class="task-card"
            :class="{ 'high-priority': task.priority === 'high' }"
          >
            <div class="task-header">
              <span class="task-title">{{ task.title }}</span>
              <span class="priority-badge" :class="task.priority">
                {{ task.priority }}
              </span>
            </div>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <div class="deadline">
                <span class="label">Échéance :</span>
                <span class="value">{{ task.deadline }}</span>
              </div>
              <div class="assignee">
                <img :src="task.assignee.avatar" :alt="task.assignee.name" class="avatar">
                <span>{{ task.assignee.name }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button @click="startTask(task.id)" class="btn-action">
                Démarrer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne En cours -->
      <div class="task-column">
        <h2>En cours</h2>
        <div class="task-list">
          <div 
            v-for="task in inProgressTasks" 
            :key="task.id" 
            class="task-card"
            :class="{ 'high-priority': task.priority === 'high' }"
          >
            <div class="task-header">
              <span class="task-title">{{ task.title }}</span>
              <span class="priority-badge" :class="task.priority">
                {{ task.priority }}
              </span>
            </div>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-progress">
              <div class="progress-bar">
                <div :style="{ width: task.progress + '%' }" class="progress"></div>
              </div>
              <span class="progress-text">{{ task.progress }}%</span>
            </div>
            <div class="task-meta">
              <div class="deadline">
                <span class="label">Échéance :</span>
                <span class="value">{{ task.deadline }}</span>
              </div>
              <div class="assignee">
                <img :src="task.assignee.avatar" :alt="task.assignee.name" class="avatar">
                <span>{{ task.assignee.name }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button @click="completeTask(task.id)" class="btn-action">
                Terminer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Terminées -->
      <div class="task-column">
        <h2>Terminées</h2>
        <div class="task-list">
          <div 
            v-for="task in completedTasks" 
            :key="task.id" 
            class="task-card completed"
          >
            <div class="task-header">
              <span class="task-title">{{ task.title }}</span>
              <span class="completion-date">{{ task.completedAt }}</span>
            </div>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-meta">
              <div class="assignee">
                <img :src="task.assignee.avatar" :alt="task.assignee.name" class="avatar">
                <span>{{ task.assignee.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour nouvelle tâche -->
    <div v-if="showNewTaskModal" class="modal">
      <div class="modal-content">
        <h2>Nouvelle Tâche</h2>
        <form @submit.prevent="createTask">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="newTask.title" type="text" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newTask.description" required></textarea>
          </div>
          <div class="form-group">
            <label>Priorité</label>
            <select v-model="newTask.priority" required>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date limite</label>
            <input v-model="newTask.deadline" type="date" required>
          </div>
          <div class="form-group">
            <label>Assigné à</label>
            <select v-model="newTask.assigneeId" required>
              <option v-for="member in teamMembers" :key="member.id" :value="member.id">
                {{ member.name }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-outline" @click="showNewTaskModal = false">
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
import { defineComponent, ref, computed } from 'vue'

interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  deadline: string
  completedAt?: string
  assignee: {
    id: number
    name: string
    avatar: string
  }
}

interface NewTask {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  deadline: string
  assigneeId: number
}

interface TeamMember {
  id: number
  name: string
  avatar: string
}

export default defineComponent({
  name: 'Tasks',
  setup() {
    const tasks = ref<Task[]>([
      {
        id: 1,
        title: 'Implémenter l\'authentification',
        description: 'Ajouter l\'authentification JWT avec refresh token',
        status: 'pending',
        priority: 'high',
        progress: 0,
        deadline: '2024-02-01',
        assignee: {
          id: 1,
          name: 'Alice',
          avatar: '/avatars/alice.jpg'
        }
      },
      {
        id: 2,
        title: 'Optimiser les performances',
        description: 'Améliorer le temps de chargement des pages',
        status: 'in-progress',
        priority: 'medium',
        progress: 60,
        deadline: '2024-02-15',
        assignee: {
          id: 2,
          name: 'Bob',
          avatar: '/avatars/bob.jpg'
        }
      },
      {
        id: 3,
        title: 'Mise à jour des dépendances',
        description: 'Mettre à jour toutes les dépendances npm',
        status: 'completed',
        priority: 'low',
        progress: 100,
        deadline: '2024-01-30',
        completedAt: '2024-01-28',
        assignee: {
          id: 3,
          name: 'Charlie',
          avatar: '/avatars/charlie.jpg'
        }
      }
    ])

    const teamMembers = ref<TeamMember[]>([
      { id: 1, name: 'Alice', avatar: '/avatars/alice.jpg' },
      { id: 2, name: 'Bob', avatar: '/avatars/bob.jpg' },
      { id: 3, name: 'Charlie', avatar: '/avatars/charlie.jpg' }
    ])

    const currentFilter = ref('all')
    const showNewTaskModal = ref(false)
    const newTask = ref<NewTask>({
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      assigneeId: 0
    })

    const pendingTasks = computed(() => 
      tasks.value.filter(task => task.status === 'pending')
    )

    const inProgressTasks = computed(() => 
      tasks.value.filter(task => task.status === 'in-progress')
    )

    const completedTasks = computed(() => 
      tasks.value.filter(task => task.status === 'completed')
    )

    const createTask = () => {
      // Logique pour créer une nouvelle tâche
      showNewTaskModal.value = false
    }

    const startTask = (taskId: number) => {
      // Logique pour démarrer une tâche
    }

    const completeTask = (taskId: number) => {
      // Logique pour terminer une tâche
    }

    return {
      tasks,
      teamMembers,
      currentFilter,
      showNewTaskModal,
      newTask,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      createTask,
      startTask,
      completeTask
    }
  }
})
</script>

<style scoped>
.tasks {
  padding: 20px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tasks-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.task-column {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
}

.task-column h2 {
  margin-bottom: 15px;
  color: #333;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-card.high-priority {
  border-left: 4px solid #dc3545;
}

.task-card.completed {
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.task-title {
  font-weight: bold;
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.priority-badge.high {
  background: #dc3545;
  color: white;
}

.priority-badge.medium {
  background: #ffc107;
  color: #000;
}

.priority-badge.low {
  background: #28a745;
  color: white;
}

.task-description {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.task-progress {
  margin: 10px 0;
}

.progress-bar {
  background: #eee;
  height: 6px;
  border-radius: 3px;
  margin-bottom: 5px;
}

.progress {
  background: #4CAF50;
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 0.9em;
}

.deadline {
  color: #666;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 5px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.task-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.btn-action {
  background: #2196F3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
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
.form-group textarea,
.form-group select {
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

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 