<template>
  <div class="chat-sidebar">
    <h2 class="sidebar-title">Actions</h2>
    
    <div class="action-buttons">
      <!-- Automation -->
      <div class="action-group">
        <h3 class="group-title">Automation</h3>
        <button
          class="action-button"
          @click="$emit('execute-action', 'make')"
          :disabled="isProcessing"
        >
          <i class="fas fa-plug"></i>
          <span>Make.com</span>
        </button>

        <button
          class="action-button"
          @click="$emit('execute-action', 'boost')"
          :disabled="isProcessing"
        >
          <i class="fas fa-rocket"></i>
          <span>Boost.space</span>
        </button>

        <button
          class="action-button"
          @click="$emit('execute-action', 'afforai')"
          :disabled="isProcessing"
        >
          <i class="fas fa-brain"></i>
          <span>Afforai</span>
        </button>
      </div>

      <!-- Growth -->
      <div class="action-group">
        <h3 class="group-title">Growth</h3>
        <button
          class="action-button"
          @click="$emit('execute-action', 'linkedin')"
          :disabled="isProcessing"
        >
          <i class="fab fa-linkedin"></i>
          <span>LinkedIn Prospection</span>
        </button>

        <button
          class="action-button"
          @click="$emit('execute-action', 'seo')"
          :disabled="isProcessing"
        >
          <i class="fas fa-search"></i>
          <span>SEO Optimization</span>
        </button>

        <button
          class="action-button"
          @click="$emit('execute-action', 'marketing')"
          :disabled="isProcessing"
        >
          <i class="fas fa-bullhorn"></i>
          <span>Marketing Campaign</span>
        </button>
      </div>

      <!-- Extensions -->
      <div class="action-group">
        <h3 class="group-title">Plus</h3>
        <button
          class="action-button"
          @click="$emit('execute-action', 'extensions')"
          :disabled="isProcessing"
        >
          <i class="fas fa-puzzle-piece"></i>
          <span>Extensions</span>
        </button>
      </div>
    </div>

    <div class="stats-section">
      <h3 class="stats-title">Performance Marketing</h3>
      <div class="stats-list">
        <div class="stat-item">
          <i class="fab fa-linkedin"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.marketingStats.linkedinConnections }}</span>
            <span class="stat-label">Connexions LinkedIn</span>
          </div>
        </div>

        <div class="stat-item">
          <i class="fas fa-chart-line"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.marketingStats.seoRank }}</span>
            <span class="stat-label">Rang SEO</span>
          </div>
        </div>

        <div class="stat-item">
          <i class="fas fa-mouse-pointer"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.marketingStats.campaignClicks }}</span>
            <span class="stat-label">Clics Campagne</span>
          </div>
        </div>

        <div class="stat-item">
          <i class="fas fa-user-plus"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.marketingStats.leadsGenerated }}</span>
            <span class="stat-label">Leads Générés</span>
          </div>
        </div>
      </div>

      <h3 class="stats-title">Tâches</h3>
      <div class="stats-list">
        <div class="stat-item">
          <i class="fas fa-tasks"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.activeTasks }}</span>
            <span class="stat-label">Tâches actives</span>
          </div>
        </div>

        <div class="stat-item">
          <i class="fas fa-chart-line"></i>
          <div class="stat-content">
            <span class="stat-value">{{ stats.analyses }}</span>
            <span class="stat-label">Analyses</span>
          </div>
        </div>
      </div>

      <h3 class="stats-title monitoring-title">Monitoring Système</h3>
      <div class="monitoring-grid">
        <div class="monitoring-item">
          <i class="fas fa-microchip"></i>
          <div class="monitoring-content">
            <span class="monitoring-value">{{ stats.systemStatus.cpu }}%</span>
            <span class="monitoring-label">CPU</span>
          </div>
        </div>

        <div class="monitoring-item">
          <i class="fas fa-memory"></i>
          <div class="monitoring-content">
            <span class="monitoring-value">{{ stats.systemStatus.memory }}%</span>
            <span class="monitoring-label">Mémoire</span>
          </div>
        </div>

        <div class="monitoring-item">
          <i class="fas fa-tachometer-alt"></i>
          <div class="monitoring-content">
            <span class="monitoring-value">{{ stats.systemStatus.latency }}ms</span>
            <span class="monitoring-label">Latence</span>
          </div>
        </div>

        <div class="monitoring-item">
          <i class="fas fa-clock"></i>
          <div class="monitoring-content">
            <span class="monitoring-value">{{ stats.systemStatus.uptime }}</span>
            <span class="monitoring-label">Uptime</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChatStats {
  activeTasks: number
  analyses: number
  systemStatus: {
    cpu: number
    memory: number
    latency: number
    uptime: string
  }
  marketingStats: {
    linkedinConnections: number
    seoRank: number
    campaignClicks: number
    leadsGenerated: number
  }
}

type ActionType = 'make' | 'boost' | 'afforai' | 'extensions' | 'linkedin' | 'seo' | 'marketing'

defineProps<{
  isProcessing: boolean
  stats: ChatStats
}>()

const emit = defineEmits<(event: 'execute-action', action: ActionType) => void>()
</script>

<style scoped lang="scss">
.chat-sidebar {
  width: 250px;
  height: 100%;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #2c3e50;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover:not(:disabled) {
    background-color: #f0f2f5;
    transform: translateX(2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  i {
    width: 20px;
    font-size: 1.1rem;
    color: #3498db;
  }

  span {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }
}

.stats-section {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  i {
    font-size: 1.1rem;
    color: #3498db;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
  }
}

.monitoring-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.monitoring-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  i {
    font-size: 1.1rem;
    color: #3498db;
  }

  .monitoring-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .monitoring-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .monitoring-label {
    font-size: 0.875rem;
    color: #666;
  }
}

.action-group {
  margin-bottom: 1.5rem;

  .group-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }
}
</style> 