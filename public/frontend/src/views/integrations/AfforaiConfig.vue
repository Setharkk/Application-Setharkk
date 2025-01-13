<template>
  <div class="afforai-config">
    <h1>Configuration Afforai</h1>
    
    <div class="status-card" :class="{ active: isConfigured }">
      <i class="fas" :class="isConfigured ? 'fa-check-circle' : 'fa-times-circle'"></i>
      <span>{{ isConfigured ? 'Connecté' : 'Non connecté' }}</span>
    </div>

    <div class="config-section">
      <h2>Clé API</h2>
      <div class="api-key">
        <input 
          v-model="displayedKey" 
          readonly
          class="api-key-input"
        >
        <button @click="toggleKeyVisibility" class="btn">
          <i class="fas" :class="showKey ? 'fa-eye-slash' : 'fa-eye'"></i>
        </button>
      </div>
    </div>

    <div class="features-section">
      <h2>Fonctionnalités disponibles</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <i class="fas fa-robot"></i>
          <h3>Analyse de texte</h3>
          <p>Analysez automatiquement le contenu de vos pages</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-brain"></i>
          <h3>Intelligence artificielle</h3>
          <p>Suggestions et optimisations automatiques</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-language"></i>
          <h3>Traitement du langage</h3>
          <p>Compréhension avancée du contexte</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-chart-line"></i>
          <h3>Analyse prédictive</h3>
          <p>Prévisions basées sur les données historiques</p>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="testConnection" class="btn primary" :disabled="!isConfigured">
        <i class="fas fa-plug"></i> Tester la connexion
      </button>
      <button @click="resetConfiguration" class="btn danger">
        <i class="fas fa-trash"></i> Réinitialiser
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'AfforaiConfig',
  
  data() {
    return {
      showKey: false,
      testStatus: null
    };
  },

  computed: {
    ...mapGetters('integrations', ['isAfforaiConfigured', 'getAfforaiKey']),
    
    isConfigured() {
      return this.isAfforaiConfigured;
    },

    maskedKey() {
      const key = this.getAfforaiKey;
      return key ? key.replace(/./g, '•').replace(/•{4}/g, '•••• ').trim() : '';
    },

    displayedKey() {
      return this.showKey ? this.getAfforaiKey : this.maskedKey;
    }
  },

  methods: {
    ...mapMutations('integrations', ['clearAfforaiKey']),

    toggleKeyVisibility() {
      this.showKey = !this.showKey;
    },

    async testConnection() {
      try {
        await this.$store.dispatch('integrations/initializeAfforai');
        this.testStatus = 'success';
        this.$toast.success('Connexion établie avec succès');
      } catch (error) {
        this.testStatus = 'error';
        this.$toast.error('Erreur de connexion');
      }
    },

    resetConfiguration() {
      if (confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
        this.clearAfforaiKey();
        this.$toast.info('Configuration réinitialisée');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.afforai-config {
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

    span {
      font-size: 16px;
      font-weight: 500;
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

    .api-key {
      display: flex;
      gap: 10px;

      input {
        flex: 1;
        padding: 12px 15px;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        background: #1a1c23;
        color: #e4e6eb;
        font-family: monospace;
        font-size: 14px;
      }

      button {
        padding: 0 15px;
      }
    }
  }

  .features-section {
    margin-bottom: 30px;

    h2 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #e4e6eb;
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
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;

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

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.danger {
        background: linear-gradient(135deg, #ff6b6b, #f03e3e);
        color: white;
        border: none;

        &:hover {
          background: linear-gradient(135deg, #f03e3e, #e03131);
        }
      }

      i {
        margin-right: 8px;
      }
    }
  }
}
</style> 