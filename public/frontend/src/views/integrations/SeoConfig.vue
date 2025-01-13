<template>
  <div class="seo-config">
    <h1>Configuration SEO</h1>
    
    <div class="status-card" :class="{ active: isConfigured }">
      <i class="fas" :class="isConfigured ? 'fa-check-circle' : 'fa-times-circle'"></i>
      <span>{{ isConfigured ? 'Activé' : 'Désactivé' }}</span>
    </div>

    <div class="config-section">
      <h2>Paramètres d'analyse</h2>
      <div class="settings-form">
        <div class="form-group">
          <label for="analysisType">Type d'analyse</label>
          <select id="analysisType" v-model="settings.analysisType">
            <option value="basic">Basique</option>
            <option value="detailed">Détaillée</option>
            <option value="technical">Technique</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="timeout">Délai maximum (secondes)</label>
          <input 
            id="timeout"
            type="number" 
            v-model.number="settings.timeout"
            min="5"
            max="60"
          >
        </div>

        <div class="form-group">
          <label for="maxRetries">Tentatives maximales</label>
          <input 
            id="maxRetries"
            type="number" 
            v-model.number="settings.maxRetries"
            min="1"
            max="5"
          >
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2>Fonctionnalités activées</h2>
      <div class="feature-grid">
        <div 
          v-for="feature in features" 
          :key="feature.id"
          class="feature-card"
          :class="{ active: feature.enabled }"
        >
          <i :class="feature.icon"></i>
          <h3>{{ feature.name }}</h3>
          <label class="feature-label" :for="'feature-' + feature.id">
            <p>{{ feature.description }}</p>
            <div class="toggle">
              <input 
                type="checkbox"
                :id="'feature-' + feature.id"
                v-model="feature.enabled"
                @change="updateFeature(feature)"
              >
              <span class="slider"></span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="saveConfiguration" class="btn primary">
        <i class="fas fa-save"></i> Enregistrer
      </button>
      <button @click="resetConfiguration" class="btn danger">
        <i class="fas fa-undo"></i> Réinitialiser
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'SeoConfig',
  
  setup() {
    const store = useStore()
    
    const settings = ref({
      analysisType: 'basic',
      timeout: 30,
      maxRetries: 3
    })

    const features = ref([
      {
        id: 1,
        name: 'Analyse de contenu',
        description: 'Analyse automatique du contenu des pages',
        icon: 'fas fa-file-alt',
        enabled: true
      },
      {
        id: 2,
        name: 'Suggestions SEO',
        description: 'Recommandations d\'optimisation',
        icon: 'fas fa-lightbulb',
        enabled: true
      },
      {
        id: 3,
        name: 'Analyse technique',
        description: 'Vérification des aspects techniques',
        icon: 'fas fa-code',
        enabled: false
      },
      {
        id: 4,
        name: 'Rapports',
        description: 'Génération de rapports détaillés',
        icon: 'fas fa-chart-bar',
        enabled: false
      }
    ])

    const isConfigured = computed(() => {
      return store.getters['integrations/isIntegrationEnabled']('seo')
    })

    const saveConfiguration = async () => {
      try {
        await store.dispatch('integrations/configureIntegration', {
          name: 'seo',
          config: {
            settings: settings.value,
            features: features.value
          }
        })
        store.dispatch('error/addNotification', {
          message: 'Configuration enregistrée avec succès',
          type: 'success'
        })
      } catch (error) {
        store.dispatch('error/addNotification', {
          message: 'Erreur lors de l\'enregistrement',
          type: 'error'
        })
      }
    }

    const resetConfiguration = () => {
      if (confirm('Voulez-vous vraiment réinitialiser la configuration ?')) {
        settings.value = {
          analysisType: 'basic',
          timeout: 30,
          maxRetries: 3
        }
        features.value.forEach(f => f.enabled = false)
        store.dispatch('error/addNotification', {
          message: 'Configuration réinitialisée',
          type: 'info'
        })
      }
    }

    const updateFeature = (feature) => {
      const index = features.value.findIndex(f => f.id === feature.id)
      if (index !== -1) {
        features.value[index] = { ...feature }
      }
    }

    return {
      settings,
      features,
      isConfigured,
      saveConfiguration,
      resetConfiguration,
      updateFeature
    }
  }
}
</script>

<style lang="scss" scoped>
.seo-config {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    font-size: 28px;
    margin-bottom: 30px;
    color: #e4e6eb;
  }

  .status-card {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    background: #2d3748;
    border-radius: 10px;
    margin-bottom: 30px;
    border: 1px solid rgba(255,255,255,0.1);

    i {
      font-size: 24px;
      margin-right: 12px;
      color: #ff6b6b;
    }

    &.active i {
      color: #40c057;
    }
  }

  .config-section {
    background: #2d3748;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;

    h2 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #e4e6eb;
    }

    .settings-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;

      .form-group {
        label {
          display: block;
          margin-bottom: 8px;
          color: #e4e6eb;
        }

        input, select {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #1a1c23;
          color: #e4e6eb;
        }
      }
    }
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;

    .feature-card {
      background: #2d3748;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;

      &.active {
        border-color: #40c057;
      }

      i {
        font-size: 24px;
        color: #6366f1;
        margin-bottom: 15px;
      }

      h3 {
        font-size: 16px;
        margin-bottom: 10px;
        color: #e4e6eb;
      }

      p {
        font-size: 14px;
        color: #a0aec0;
        margin-bottom: 15px;
      }

      .toggle {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;

        input {
          opacity: 0;
          width: 0;
          height: 0;

          &:checked + .slider {
            background-color: #40c057;
          }

          &:checked + .slider:before {
            transform: translateX(26px);
          }
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #4a5568;
          transition: .4s;
          border-radius: 34px;

          &:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 30px;

    .btn {
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &.primary {
        background: linear-gradient(135deg, #6366f1, #4338ca);
        color: white;
        border: none;

        &:hover {
          background: linear-gradient(135deg, #4338ca, #3730a3);
        }
      }

      &.danger {
        background: transparent;
        border: 1px solid #ff6b6b;
        color: #ff6b6b;

        &:hover {
          background: rgba(255,107,107,0.1);
        }
      }

      i {
        margin-right: 8px;
      }
    }
  }
}
</style> 