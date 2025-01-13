<template>
  <div class="suggestions-container">
    <div class="suggestions-header">
      <h3>Recommandations SEO</h3>
      <div class="score-badge" :class="getScoreClass(seoScore)">
        {{ seoScore }}/100
      </div>
    </div>

    <div class="suggestions-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Analyse en cours...</p>
      </div>

      <template v-else>
        <div v-for="(category, index) in suggestions" :key="index" class="suggestion-category">
          <h4>{{ category.title }}</h4>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${category.score}%` }"
              :class="getScoreClass(category.score)"></div>
          </div>
          
          <ul class="suggestions-list">
            <li v-for="(item, idx) in category.items" :key="idx"
              :class="['suggestion-item', item.priority]">
              <i :class="['fas', getIconForPriority(item.priority)]"></i>
              <div class="suggestion-content">
                <h5>{{ item.title }}</h5>
                <p>{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAIController } from './AIController';

export default {
  name: 'Suggestions',
  props: {
    pageUrl: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const loading = ref(true);
    const seoScore = ref(0);
    const suggestions = ref([]);
    const aiController = useAIController();

    const getScoreClass = (score) => {
      if (score >= 80) return 'success';
      if (score >= 60) return 'warning';
      return 'error';
    };

    const getIconForPriority = (priority) => {
      const icons = {
        high: 'fa-exclamation-circle',
        medium: 'fa-info-circle',
        low: 'fa-check-circle'
      };
      return icons[priority] || 'fa-info-circle';
    };

    const analyzePage = async () => {
      loading.value = true;
      try {
        const analysisData = await aiController.analyzeUrl(props.pageUrl);
        const formattedResults = aiController.formatAnalysisResults(analysisData);
        
        seoScore.value = formattedResults.score;
        suggestions.value = Object.entries(formattedResults.categories).map(([key, value]) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          score: value.score,
          items: value.suggestions.map(suggestion => ({
            title: suggestion.title,
            description: suggestion.description,
            priority: suggestion.priority
          }))
        }));
      } catch (error) {
        console.error('Erreur lors de l\'analyse SEO:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      analyzePage();
    });

    return {
      loading,
      seoScore,
      suggestions,
      getScoreClass,
      getIconForPriority
    };
  }
};
</script>

<style scoped>
.suggestions-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.suggestions-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.score-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.score-badge.success { background: #dcfce7; color: #166534; }
.score-badge.warning { background: #fef3c7; color: #92400e; }
.score-badge.error { background: #fee2e2; color: #991b1b; }

.suggestions-content {
  padding: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.suggestion-category {
  margin-bottom: 2rem;
}

.suggestion-category h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress {
  height: 100%;
  transition: width 0.3s ease;
}

.progress.success { background: #22c55e; }
.progress.warning { background: #eab308; }
.progress.error { background: #ef4444; }

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestion-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.suggestion-item.high { border-left: 4px solid #ef4444; }
.suggestion-item.medium { border-left: 4px solid #eab308; }
.suggestion-item.low { border-left: 4px solid #22c55e; }

.suggestion-item i {
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.suggestion-item.high i { color: #ef4444; }
.suggestion-item.medium i { color: #eab308; }
.suggestion-item.low i { color: #22c55e; }

.suggestion-content h5 {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.suggestion-content p {
  font-size: 0.875rem;
  color: #6b7280;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
