<template>
  <div class="analyser">
    <h2>SEO Analysis</h2>
    <div class="input-section">
      <input 
        v-model="url" 
        type="url" 
        placeholder="Enter URL to analyze"
        @keyup.enter="analyze"
      />
      <base-button @click="analyze" :loading="loading">
        Analyze
      </base-button>
    </div>
    
    <div v-if="loading" class="loading">
      Analyzing URL...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="results" class="results">
      <div class="score">
        Score: {{ results.score }}/100
      </div>
      <div class="suggestions">
        <h3>Suggestions</h3>
        <ul>
          <li v-for="(suggestion, index) in results.suggestions" 
              :key="index"
              :class="suggestion.priority">
            {{ suggestion.content }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import BaseButton from '../common/Button.vue'
import { useStore } from 'vuex'

export default {
  name: 'SEOAnalyser',
  
  components: {
    BaseButton
  },

  setup() {
    const store = useStore()
    const url = ref('')
    const loading = ref(false)
    const error = ref(null)
    const results = ref(null)

    async function analyze() {
      if (!url.value) {
        error.value = 'Please enter a URL'
        return
      }

      try {
        loading.value = true
        error.value = null
        results.value = await store.dispatch('seo/analyzeUrl', url.value)
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      url,
      loading,
      error,
      results,
      analyze
    }
  }
}
</script>

<style lang="scss" scoped>
.analyser {
  padding: 20px;

  .input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }

  .loading {
    text-align: center;
    color: #666;
  }

  .error {
    color: #f44336;
    padding: 10px;
    background: #ffebee;
    border-radius: 4px;
  }

  .results {
    .score {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .suggestions {
      li {
        margin: 10px 0;
        padding: 8px;
        border-radius: 4px;

        &.high {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }

        &.medium {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
        }

        &.low {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
      }
    }
  }
}
</style>
