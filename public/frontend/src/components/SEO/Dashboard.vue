<template>
  <div class="dashboard">
    <h1>SEO Dashboard</h1>
    <div class="metrics">
      <div class="metric-card" v-for="metric in metrics" :key="metric.id">
        <h3>{{ metric.title }}</h3>
        <div class="value">{{ metric.value }}</div>
      </div>
    </div>
    <div class="recent-analyses">
      <h2>Recent Analyses</h2>
      <ul>
        <li v-for="analysis in recentAnalyses" :key="analysis.id">
          <span class="url">{{ analysis.url }}</span>
          <span class="score">Score: {{ analysis.score }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SEODashboard',
  data() {
    return {
      metrics: [],
      recentAnalyses: []
    }
  },
  async created() {
    await this.fetchMetrics()
    await this.fetchRecentAnalyses()
  },
  methods: {
    async fetchMetrics() {
      try {
        const response = await fetch('/api/metrics')
        this.metrics = await response.json()
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    },
    async fetchRecentAnalyses() {
      try {
        const response = await fetch('/api/analyses/recent')
        this.recentAnalyses = await response.json()
      } catch (error) {
        console.error('Error fetching analyses:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  
  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }

  .metric-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}
</style>
