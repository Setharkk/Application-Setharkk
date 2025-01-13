<template>
  <div class="extension-manager">
    <v-card class="extension-card">
      <v-card-title>
        Extensions
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          small
          @click="refreshExtensions"
          :loading="loading"
        >
          <v-icon left>mdi-refresh</v-icon>
          Actualiser
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert
          type="info"
          outlined
        >
          Le système d'extensions sera bientôt disponible. Vous pourrez ajouter de nouvelles fonctionnalités à votre application.
        </v-alert>

        <!-- Liste des futures extensions -->
        <v-list>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-puzzle</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Extensions personnalisées</v-list-item-title>
              <v-list-item-subtitle>Ajoutez vos propres fonctionnalités</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                text
                small
                disabled
              >
                Bientôt disponible
              </v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-api</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>API personnalisée</v-list-item-title>
              <v-list-item-subtitle>Intégrez vos propres API</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                text
                small
                disabled
              >
                Bientôt disponible
              </v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-theme-light-dark</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Thèmes personnalisés</v-list-item-title>
              <v-list-item-subtitle>Créez vos propres thèmes</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                text
                small
                disabled
              >
                Bientôt disponible
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ExtensionManager',

  setup() {
    const loading = ref(false)

    const refreshExtensions = async () => {
      loading.value = true
      try {
        // Ici, nous ajouterons la logique pour rafraîchir les extensions
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des extensions:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      refreshExtensions
    }
  }
})
</script>

<style scoped>
.extension-manager {
  padding: 16px;
}

.extension-card {
  height: 100%;
}
</style> 