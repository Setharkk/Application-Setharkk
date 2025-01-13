<template>
  <div class="dashboard">
    <h1>Tableau de bord</h1>
    
    <div class="dashboard-grid">
      <!-- Widget des tâches récentes -->
      <div class="widget">
        <h2>Tâches récentes</h2>
        <ul class="task-list">
          <li v-for="task in recentTasks" :key="task.id" class="task-item">
            <span class="task-title">{{ task.title }}</span>
            <span class="task-status" :class="task.status">{{ task.status }}</span>
          </li>
        </ul>
      </div>

      <!-- Widget des projets en cours -->
      <div class="widget">
        <h2>Projets en cours</h2>
        <div class="project-list">
          <div v-for="project in activeProjects" :key="project.id" class="project-item">
            <h3>{{ project.name }}</h3>
            <div class="progress-bar">
              <div :style="{ width: project.progress + '%' }" class="progress"></div>
            </div>
            <span class="progress-text">{{ project.progress }}%</span>
          </div>
        </div>
      </div>

      <!-- Widget du calendrier -->
      <div class="widget">
        <h2>Événements à venir</h2>
        <div class="calendar-events">
          <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
            <span class="event-date">{{ event.date }}</span>
            <span class="event-title">{{ event.title }}</span>
          </div>
        </div>
      </div>

      <!-- Widget des messages -->
      <div class="widget">
        <h2>Messages récents</h2>
        <div class="message-list">
          <div v-for="message in recentMessages" :key="message.id" class="message-item">
            <img :src="message.avatar" :alt="message.sender" class="avatar">
            <div class="message-content">
              <span class="sender">{{ message.sender }}</span>
              <p class="preview">{{ message.preview }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const recentTasks = ref([
      { id: 1, title: 'Mise à jour du frontend', status: 'en-cours' },
      { id: 2, title: 'Test des API', status: 'terminé' },
      { id: 3, title: 'Déploiement', status: 'en-attente' }
    ])

    const activeProjects = ref([
      { id: 1, name: 'Projet A', progress: 75 },
      { id: 2, name: 'Projet B', progress: 30 },
      { id: 3, name: 'Projet C', progress: 90 }
    ])

    const upcomingEvents = ref([
      { id: 1, date: '2024-01-15', title: 'Réunion d\'équipe' },
      { id: 2, date: '2024-01-17', title: 'Revue de code' },
      { id: 3, date: '2024-01-20', title: 'Démo client' }
    ])

    const recentMessages = ref([
      { 
        id: 1, 
        sender: 'Alice', 
        preview: 'Bonjour, pouvez-vous revoir...', 
        avatar: '/avatars/alice.jpg' 
      },
      { 
        id: 2, 
        sender: 'Bob', 
        preview: 'Le déploiement est terminé...', 
        avatar: '/avatars/bob.jpg' 
      }
    ])

    return {
      recentTasks,
      activeProjects,
      upcomingEvents,
      recentMessages
    }
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.widget {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-list, .project-list, .calendar-events, .message-list {
  margin-top: 10px;
}

.task-item, .project-item, .event-item, .message-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.progress-bar {
  background: #eee;
  height: 10px;
  border-radius: 5px;
  margin: 5px 0;
}

.progress {
  background: #4CAF50;
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-item {
  display: flex;
  align-items: center;
}

.message-content {
  flex: 1;
}

.sender {
  font-weight: bold;
}

.preview {
  color: #666;
  margin: 0;
}

.task-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.task-status.en-cours {
  background: #FFF3CD;
  color: #856404;
}

.task-status.terminé {
  background: #D4EDDA;
  color: #155724;
}

.task-status.en-attente {
  background: #F8D7DA;
  color: #721C24;
}
</style> 