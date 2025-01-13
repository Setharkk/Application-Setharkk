<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Réinitialisation du mot de passe</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <p class="text-body-1 mb-4">
              Entrez votre adresse email pour recevoir les instructions de réinitialisation.
            </p>

            <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              :loading="loading"
              color="primary"
              @click="handleSubmit"
            >
              Envoyer les instructions
            </v-btn>
          </v-card-actions>

          <v-card-text class="text-center">
            <router-link to="/auth/login">
              Retour à la connexion
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'
import type { PasswordResetRequest } from '@/types/auth'

export default defineComponent({
  name: 'ForgotPassword',

  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref<VForm | null>(null)

    // État du formulaire
    const email = ref('')
    const isValid = ref(false)
    const loading = ref(false)

    // Règles de validation
    const emailRules = [
      (v: string) => !!v || 'L\'email est requis',
      (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    // Méthodes
    const handleSubmit = async () => {
      if (!form.value?.validate()) return

      loading.value = true

      try {
        const resetData: PasswordResetRequest = {
          email: email.value
        }

        await store.dispatch('auth/requestPasswordReset', resetData)
        router.push('/auth/login?reset=requested')
      } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      // Refs
      form,
      email,
      isValid,
      loading,

      // Règles
      emailRules,

      // Méthodes
      handleSubmit
    }
  }
})
</script>

<style lang="scss" scoped>
.v-card {
  .v-card-text {
    padding-top: 24px;
  }

  a {
    text-decoration: none;
    color: var(--v-primary-base);
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style> 