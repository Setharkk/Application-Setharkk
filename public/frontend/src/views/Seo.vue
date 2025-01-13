<template>
  <div class="seo-dashboard">
    <!-- En-tête SEO -->
    <header class="seo-header">
      <div class="header-main">
        <h1>Analyse SEO</h1>
        <div class="score-overview">
          <div class="score-card" :class="getScoreClass(seoScore)">
            <h3>Score Global</h3>
            <div class="score">{{ seoScore }}/100</div>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="startNewAnalysis">
          <i class="fas fa-sync"></i>
          Nouvelle analyse
        </button>
        <button class="btn-secondary" @click="exportReport">
          <i class="fas fa-download"></i>
          Exporter le rapport
        </button>
      </div>
    </header>

    <!-- Grille d'analyse -->
    <div class="analysis-grid">
      <!-- Performance -->
      <div class="analysis-card">
        <div class="card-header">
          <i class="fas fa-tachometer-alt"></i>
          <h3>Performance</h3>
        </div>
        <div class="metrics">
          <div class="metric" v-for="metric in performanceMetrics" :key="metric.name">
            <div class="metric-info">
              <span class="metric-name">{{ metric.name }}</span>
              <span class="metric-value" :class="getMetricClass(metric.score)">
                {{ metric.value }}
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: metric.score + '%' }" :class="getMetricClass(metric.score)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mots-clés -->
      <div class="analysis-card">
        <div class="card-header">
          <i class="fas fa-key"></i>
          <h3>Mots-clés</h3>
        </div>
        <div class="keywords-list">
          <div class="keyword-item" v-for="keyword in keywords" :key="keyword.word">
            <div class="keyword-info">
              <span class="keyword">{{ keyword.word }}</span>
              <span class="position" :class="getPositionClass(keyword.position)">
                {{ keyword.position > 0 ? '#' + keyword.position : 'N/A' }}
              </span>
            </div>
            <div class="keyword-metrics">
              <div class="metric">
                <span class="label">Volume</span>
                <span class="value">{{ keyword.volume }}</span>
              </div>
              <div class="metric">
                <span class="label">CPC</span>
                <span class="value">{{ keyword.cpc }}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Backlinks -->
      <div class="analysis-card">
        <div class="card-header">
          <i class="fas fa-link"></i>
          <h3>Backlinks</h3>
        </div>
        <div class="backlinks-overview">
          <div class="backlink-stat">
            <span class="stat-value">{{ backlinksStats.total }}</span>
            <span class="stat-label">Total Backlinks</span>
          </div>
          <div class="backlink-stat">
            <span class="stat-value">{{ backlinksStats.domains }}</span>
            <span class="stat-label">Domaines uniques</span>
          </div>
          <div class="backlink-quality">
            <div class="quality-bar">
              <div class="quality-segment" 
                   v-for="quality in backlinksStats.quality" 
                   :key="quality.type"
                   :style="{ width: quality.percentage + '%' }"
                   :class="quality.type">
              </div>
            </div>
            <div class="quality-legend">
              <span class="legend-item">
                <span class="dot high"></span>
                Haute qualité ({{ backlinksStats.quality[0].percentage }}%)
              </span>
              <span class="legend-item">
                <span class="dot medium"></span>
                Moyenne ({{ backlinksStats.quality[1].percentage }}%)
              </span>
              <span class="legend-item">
                <span class="dot low"></span>
                Faible ({{ backlinksStats.quality[2].percentage }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Problèmes techniques -->
      <div class="analysis-card">
        <div class="card-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Problèmes techniques</h3>
        </div>
        <div class="issues-list">
          <div class="issue-item" v-for="issue in technicalIssues" :key="issue.id"
               :class="issue.severity">
            <div class="issue-icon">
              <i :class="getIssueIcon(issue.severity)"></i>
            </div>
            <div class="issue-content">
              <h4>{{ issue.title }}</h4>
              <p>{{ issue.description }}</p>
              <button class="btn-fix" @click="fixIssue(issue.id)">
                Corriger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Score SEO global
const seoScore = ref(87)

// Métriques de performance
const performanceMetrics = ref([
  { name: 'Vitesse de chargement', value: '2.3s', score: 85 },
  { name: 'First Contentful Paint', value: '1.8s', score: 90 },
  { name: 'Time to Interactive', value: '3.2s', score: 75 },
  { name: 'Performance mobile', value: '82/100', score: 82 }
])

// Mots-clés
const keywords = ref([
  { word: 'marketing digital', position: 3, volume: '12.5K', cpc: 2.45 },
  { word: 'stratégie seo', position: 5, volume: '8.2K', cpc: 1.85 },
  { word: 'référencement naturel', position: 2, volume: '15.3K', cpc: 3.20 },
  { word: 'analyse seo', position: 8, volume: '5.1K', cpc: 1.15 }
])

// Statistiques backlinks
const backlinksStats = ref({
  total: 1234,
  domains: 456,
  quality: [
    { type: 'high', percentage: 45 },
    { type: 'medium', percentage: 35 },
    { type: 'low', percentage: 20 }
  ]
})

// Problèmes techniques
const technicalIssues = ref([
  {
    id: 1,
    severity: 'critical',
    title: 'Pages non indexables',
    description: '3 pages importantes ne sont pas indexables par les moteurs de recherche.'
  },
  {
    id: 2,
    severity: 'warning',
    title: 'Images sans alt text',
    description: '12 images n\'ont pas de texte alternatif défini.'
  },
  {
    id: 3,
    severity: 'info',
    title: 'Liens internes',
    description: 'Opportunité d\'améliorer la structure des liens internes.'
  }
])

// Méthodes utilitaires
const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'average'
  return 'poor'
}

const getMetricClass = (score: number) => {
  if (score >= 90) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'average'
  return 'poor'
}

const getPositionClass = (position: number) => {
  if (position <= 3) return 'top'
  if (position <= 10) return 'good'
  return 'average'
}

const getIssueIcon = (severity: string) => {
  const icons = {
    critical: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  }
  return icons[severity as keyof typeof icons]
}

// Actions
const startNewAnalysis = () => {
  // Logique pour lancer une nouvelle analyse
}

const exportReport = () => {
  // Logique pour exporter le rapport
}

const fixIssue = (issueId: number) => {
  console.log(`Correction du problème #${issueId} en cours...`)
  // Logique pour corriger un problème
}
</script>

<style scoped>
.seo-dashboard {
  padding: 1.5rem;
}

.seo-header {
  margin-bottom: 2rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.score-overview {
  display: flex;
  gap: 1rem;
}

.score-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  min-width: 150px;
}

.score {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-secondary {
  background: #edf2f7;
  color: #2d3748;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.card-header i {
  font-size: 1.25rem;
  color: #4299e1;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric {
  margin-bottom: 1rem;
}

.metric-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-bar {
  background: #edf2f7;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  transition: width 0.3s ease;
}

.progress.excellent { background: #48bb78; }
.progress.good { background: #4299e1; }
.progress.average { background: #ed8936; }
.progress.poor { background: #f56565; }

.keywords-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.keyword-item {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 6px;
}

.keyword-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.keyword {
  font-weight: 500;
}

.position {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.position.top { background: #c6f6d5; color: #2f855a; }
.position.good { background: #bee3f8; color: #2c5282; }
.position.average { background: #feebc8; color: #9c4221; }

.keyword-metrics {
  display: flex;
  gap: 1rem;
}

.keyword-metrics .metric {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.keyword-metrics .label {
  font-size: 0.75rem;
  color: #718096;
}

.keyword-metrics .value {
  font-weight: 500;
}

.backlinks-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.backlink-stat {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  display: block;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
}

.quality-bar {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.quality-segment {
  height: 100%;
}

.quality-segment.high { background: #48bb78; }
.quality-segment.medium { background: #4299e1; }
.quality-segment.low { background: #f56565; }

.quality-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.high { background: #48bb78; }
.dot.medium { background: #4299e1; }
.dot.low { background: #f56565; }

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.issue-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 6px;
  background: #f7fafc;
}

.issue-item.critical { border-left: 4px solid #f56565; }
.issue-item.warning { border-left: 4px solid #ed8936; }
.issue-item.info { border-left: 4px solid #4299e1; }

.issue-icon {
  font-size: 1.25rem;
}

.issue-item.critical .issue-icon { color: #f56565; }
.issue-item.warning .issue-icon { color: #ed8936; }
.issue-item.info .issue-icon { color: #4299e1; }

.issue-content h4 {
  margin: 0 0 0.5rem 0;
}

.issue-content p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

.btn-fix {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #edf2f7;
  color: #2d3748;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-fix:hover {
  background: #e2e8f0;
}
</style> 