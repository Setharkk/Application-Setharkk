<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Inscription</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
              <v-text-field
                v-model="name"
                :rules="nameRules"
                label="Nom complet"
                prepend-icon="mdi-account"
                required
              />

              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              />

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Mot de passe"
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
              S'inscrire
            </v-btn>
          </v-card-actions>

          <v-card-text class="text-center">
            <router-link to="/auth/login">
              Déjà un compte ? Se connecter
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
import type { RegisterCredentials } from '@/types/auth'

export default defineComponent({
  name: 'Register',

  setup() {
    const store = useStore()
    const router = useRouter()
    const form = ref<VForm | null>(null)

    // État du formulaire
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const passwordConfirmation = ref('')
    const showPassword = ref(false)
    const showPasswordConfirmation = ref(false)
    const isValid = ref(false)
    const loading = ref(false)

    // Règles de validation
    const nameRules = [
      (v: string) => !!v || 'Le nom est requis',
      (v: string) => v.length >= 2 || 'Le nom doit contenir au moins 2 caractères'
    ]

    const emailRules = [
      (v: string) => !!v || 'L\'email est requis',
      (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

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
        const registerData: RegisterCredentials = {
          name: name.value,
          email: email.value,
          password: password.value,
          passwordConfirmation: passwordConfirmation.value
        }

        await store.dispatch('auth/register', registerData)
        router.push('/auth/login?registered=success')
      } catch (error) {
        console.error('Erreur d\'inscription:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      // Refs
      form,
      name,
      email,
      password,
      passwordConfirmation,
      showPassword,
      showPasswordConfirmation,
      isValid,
      loading,

      // Règles
      nameRules,
      emailRules,
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