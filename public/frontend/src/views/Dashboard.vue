<template>
  <div class="dashboard">
    <!-- En-tête du tableau de bord -->
    <header class="dashboard-header">
      <h1>Tableau de bord</h1>
      <div class="date-picker">
        <select v-model="selectedPeriod">
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>
    </header>

    <!-- Cartes de statistiques -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in statistics" :key="stat.id">
        <div class="stat-icon" :class="stat.color">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stat.title }}</h3>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-change" :class="stat.trend">
            {{ stat.change }}
            <i :class="stat.trend === 'up' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </p>
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Activité utilisateurs</h3>
        <canvas ref="usersChart"></canvas>
      </div>
      <div class="chart-card">
        <h3>Performance marketing</h3>
        <canvas ref="marketingChart"></canvas>
      </div>
    </div>

    <!-- Dernières activités -->
    <div class="recent-activities">
      <h3>Activités récentes</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <p class="activity-time">{{ activity.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js'

// État
const selectedPeriod = ref('week')
const usersChart = ref(null)
const marketingChart = ref(null)

// Données statiques pour la démo
const statistics = [
  {
    id: 1,
    title: 'Utilisateurs actifs',
    value: '1,234',
    change: '+12.5%',
    trend: 'up',
    icon: 'fas fa-users',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Revenus',
    value: '45,678 €',
    change: '+8.3%',
    trend: 'up',
    icon: 'fas fa-euro-sign',
    color: 'green'
  },
  {
    id: 3,
    title: 'Conversions',
    value: '234',
    change: '-2.1%',
    trend: 'down',
    icon: 'fas fa-chart-line',
    color: 'orange'
  },
  {
    id: 4,
    title: 'Temps moyen',
    value: '12:34',
    change: '+5.7%',
    trend: 'up',
    icon: 'fas fa-clock',
    color: 'purple'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'user',
    icon: 'fas fa-user',
    text: 'Nouveau client inscrit',
    time: 'Il y a 5 minutes'
  },
  {
    id: 2,
    type: 'sale',
    icon: 'fas fa-shopping-cart',
    text: 'Nouvelle vente effectuée',
    time: 'Il y a 15 minutes'
  },
  {
    id: 3,
    type: 'alert',
    icon: 'fas fa-exclamation-triangle',
    text: 'Alerte de performance détectée',
    time: 'Il y a 30 minutes'
  }
]

// Initialisation des graphiques
onMounted(() => {
  if (usersChart.value) {
    new Chart(usersChart.value, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Utilisateurs actifs',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          lineTension: 0.1
        }]
      }
    })
  }

  if (marketingChart.value) {
    new Chart(marketingChart.value, {
      type: 'bar',
      data: {
        labels: ['Email', 'Social', 'Search', 'Direct'],
        datasets: [{
          label: 'Conversions par canal',
          data: [12, 19, 3, 5],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      }
    })
  }
})
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.date-picker select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.blue { background-color: #ebf8ff; color: #4299e1; }
.stat-icon.green { background-color: #f0fff4; color: #48bb78; }
.stat-icon.orange { background-color: #fffaf0; color: #ed8936; }
.stat-icon.purple { background-color: #faf5ff; color: #9f7aea; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.stat-change {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.up { color: #48bb78; }
.stat-change.down { color: #f56565; }

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin-bottom: 1rem;
}

.recent-activities {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-list {
  margin-top: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.activity-icon.user { background-color: #ebf8ff; color: #4299e1; }
.activity-icon.sale { background-color: #f0fff4; color: #48bb78; }
.activity-icon.alert { background-color: #fff5f5; color: #f56565; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-weight: 500;
}

.activity-time {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}
</style> 