<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Nouveau mot de passe</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <p class="text-body-1 mb-4">
              Veuillez choisir votre nouveau mot de passe.
            </p>

            <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Nouveau mot de passe"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
              />

              <v-text-field
                v-model="passwordConfirmation"
                :rules="[...passwordRules, passwordMatchRule]"
                label="Confirmer le mot de passe"
                prepend-icon="mdi-lock-check"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                :append-icon="showPasswordConfirmation ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPasswordConfirmation = !showPasswordConfirmation"
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
              Réinitialiser le mot de passe
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
import { defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'
import type { PasswordResetConfirm } from '@/types/auth'

export default defineComponent({
  name: 'ResetPassword',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const form = ref<VForm | null>(null)

    // État du formulaire
    const password = ref('')
    const passwordConfirmation = ref('')
    const showPassword = ref(false)
    const showPasswordConfirmation = ref(false)
    const isValid = ref(false)
    const loading = ref(false)
    const token = ref('')

    // Règles de validation
    const passwordRules = [
      (v: string) => !!v || 'Le mot de passe est requis',
      (v: string) => v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères',
      (v: string) => /[A-Z]/.test(v) || 'Le mot de passe doit contenir au moins une majuscule',
      (v: string) => /\d/.test(v) || 'Le mot de passe doit contenir au moins un chiffre'
    ]

    const passwordMatchRule = (v: string) => 
      v === password.value || 'Les mots de passe ne correspondent pas'

    // Méthodes
    const handleSubmit = async () => {
      if (!form.value?.validate()) return

      loading.value = true

      try {
        const resetData: PasswordResetConfirm = {
          token: token.value,
          password: password.value,
          passwordConfirmation: passwordConfirmation.value
        }

        await store.dispatch('auth/resetPassword', resetData)
        router.push('/auth/login?reset=success')
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error)
      } finally {
        loading.value = false
      }
    }

    // Vérification du token à l'initialisation
    onMounted(() => {
      const resetToken = route.params.token as string
      if (!resetToken) {
        router.push('/auth/forgot-password')
        return
      }
      token.value = resetToken
    })

    return {
      // Refs
      form,
      password,
      passwordConfirmation,
      showPassword,
      showPasswordConfirmation,
      isValid,
      loading,

      // Règles
      passwordRules,
      passwordMatchRule,

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