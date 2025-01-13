<template>
  <div class="integrations">
    <div class="header">
      <h1>Intégrations</h1>
      <p>Gérez vos intégrations et configurations</p>
    </div>

    <div class="integration-grid">
      <router-link 
        v-for="integration in integrations" 
        :key="integration.id"
        :to="integration.route"
        class="integration-card"
        :class="{ active: integration.enabled }"
      >
        <div class="icon">
          <i :class="integration.icon"></i>
        </div>
        <div class="content">
          <h3>{{ integration.name }}</h3>
          <p>{{ integration.description }}</p>
        </div>
        <div class="status">
          <span :class="integration.enabled ? 'active' : 'inactive'">
            {{ integration.enabled ? 'Activé' : 'Désactivé' }}
          </span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'IntegrationsIndex',

  setup() {
    const store = useStore()

    const integrations = computed(() => [
      {
        id: 'afforai',
        name: 'Afforai',
        description: 'Intelligence artificielle pour l\'analyse de contenu',
        icon: 'fas fa-robot',
        route: '/integrations/afforai',
        enabled: store.getters['integrations/isIntegrationEnabled']('afforai')
      },
      {
        id: 'seo',
        name: 'SEO',
        description: 'Optimisation pour les moteurs de recherche',
        icon: 'fas fa-search',
        route: '/integrations/seo',
        enabled: store.getters['integrations/isIntegrationEnabled']('seo')
      }
    ])

    return {
      integrations
    }
  }
}
</script>

<style lang="scss" scoped>
.integrations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .header {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      font-size: 32px;
      color: #e4e6eb;
      margin-bottom: 10px;
    }

    p {
      color: #a0aec0;
      font-size: 16px;
    }
  }

  .integration-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;

    .integration-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #2d3748;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }

      &.active {
        border-color: #40c057;
      }

      .icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(99,102,241,0.1);
        border-radius: 12px;
        margin-right: 15px;

        i {
          font-size: 24px;
          color: #6366f1;
        }
      }

      .content {
        flex: 1;

        h3 {
          font-size: 18px;
          color: #e4e6eb;
          margin-bottom: 5px;
        }

        p {
          font-size: 14px;
          color: #a0aec0;
        }
      }

      .status {
        span {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;

          &.active {
            background: rgba(64,192,87,0.1);
            color: #40c057;
          }

          &.inactive {
            background: rgba(255,107,107,0.1);
            color: #ff6b6b;
          }
        }
      }
    }
  }
}
</style> 