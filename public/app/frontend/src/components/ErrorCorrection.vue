<template>
  <div class="error-correction">
    <div class="error-correction__header">
      <h2>Système de Correction d'Erreurs</h2>
      <div class="error-correction__stats">
        <span>Erreurs corrigées: {{ stats.corrected }}</span>
        <span>En attente: {{ stats.pending }}</span>
      </div>
    </div>

    <div class="error-correction__content">
      <!-- Liste des erreurs actives -->
      <div class="error-list" v-if="activeErrors.length">
        <h3>Erreurs Actives</h3>
        <div v-for="error in activeErrors" :key="error.id" class="error-item">
          <div class="error-item__header">
            <span class="error-type" :class="error.category">{{ error.category }}</span>
            <span class="error-timestamp">{{ formatDate(error.timestamp) }}</span>
          </div>
          <div class="error-item__message">{{ error.message }}</div>
          <div class="error-item__actions">
            <button @click="handleError(error)" :disabled="error.processing">
              Corriger
            </button>
            <button @click="analyzeError(error)" :disabled="error.processing">
              Analyser
            </button>
          </div>
          <div v-if="error.suggestions.length" class="error-item__suggestions">
            <h4>Suggestions</h4>
            <ul>
              <li v-for="(suggestion, index) in error.suggestions" 
                  :key="index"
                  @click="applySuggestion(error, suggestion)"
                  class="suggestion-item">
                <div class="suggestion-content">
                  <span class="suggestion-confidence">
                    {{ Math.round(suggestion.confidence) }}%
                  </span>
                  <span class="suggestion-description">
                    {{ suggestion.description }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Historique des corrections -->
      <div class="error-history">
        <h3>Historique des Corrections</h3>
        <div v-for="item in errorHistory" :key="item.timestamp" class="history-item">
          <div class="history-item__header">
            <span class="history-timestamp">{{ formatDate(item.timestamp) }}</span>
            <span class="history-status" :class="item.success ? 'success' : 'failure'">
              {{ item.success ? 'Succès' : 'Échec' }}
            </span>
          </div>
          <div class="history-item__message">{{ item.error }}</div>
          <div v-if="item.solution" class="history-item__solution">
            Solution appliquée: {{ item.solution }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'ErrorCorrection',
  
  setup() {
    const activeErrors = ref([]);
    const errorHistory = ref([]);
    const stats = ref({
      corrected: 0,
      pending: 0
    });

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    const fetchErrorHistory = async () => {
      try {
        const response = await axios.get('/api/errors/history');
        errorHistory.value = response.data.history;
        updateStats();
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'historique:', err);
      }
    };

    const handleError = async (error) => {
      try {
        error.processing = true;
        const response = await axios.post('/api/errors/handle', {
          error,
          context: error.context
        });
        
        if (response.data.success) {
          activeErrors.value = activeErrors.value.filter(e => e.id !== error.id);
          await fetchErrorHistory();
        } else {
          error.suggestions = response.data.suggestions;
        }
      } catch (err) {
        console.error('Erreur lors du traitement:', err);
      } finally {
        error.processing = false;
      }
    };

    const analyzeError = async (error) => {
      try {
        error.processing = true;
        const response = await axios.post('/api/errors/analyze', {
          error,
          context: error.context
        });
        
        error.analysis = response.data.analysis;
        error.suggestions = response.data.suggestions;
      } catch (err) {
        console.error('Erreur lors de l\'analyse:', err);
      } finally {
        error.processing = false;
      }
    };

    const applySuggestion = async (error, suggestion) => {
      try {
        error.processing = true;
        const response = await axios.post('/api/errors/handle', {
          error,
          context: error.context,
          solution: suggestion.solution
        });
        
        if (response.data.success) {
          activeErrors.value = activeErrors.value.filter(e => e.id !== error.id);
          await fetchErrorHistory();
        }
      } catch (err) {
        console.error('Erreur lors de l\'application de la suggestion:', err);
      } finally {
        error.processing = false;
      }
    };

    const updateStats = () => {
      stats.value = {
        corrected: errorHistory.value.filter(h => h.success).length,
        pending: activeErrors.value.length
      };
    };

    onMounted(async () => {
      await fetchErrorHistory();
    });

    return {
      activeErrors,
      errorHistory,
      stats,
      formatDate,
      handleError,
      analyzeError,
      applySuggestion
    };
  }
};
</script>

<style scoped>
.error-correction {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.error-correction__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.error-correction__stats {
  display: flex;
  gap: 20px;
}

.error-list {
  margin-bottom: 30px;
}

.error-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error-item__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.error-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.error-item__message {
  margin-bottom: 15px;
  font-family: monospace;
  white-space: pre-wrap;
}

.error-item__actions {
  display: flex;
  gap: 10px;
}

.error-item__suggestions {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.suggestion-item {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
  background: #fff;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: #f0f0f0;
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.suggestion-confidence {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.history-item {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
}

.history-item__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.history-status {
  font-weight: 500;
}

.history-status.success {
  color: #28a745;
}

.history-status.failure {
  color: #dc3545;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 