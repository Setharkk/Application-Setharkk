<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Connexion</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
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

              <v-checkbox
                v-model="rememberMe"
                label="Se souvenir de moi"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="loading"
              @click="handleSubmit"
            >
              Se connecter
            </v-btn>
          </v-card-actions>

          <v-card-text class="text-center">
            <router-link to="/auth/forgot-password">
              Mot de passe oublié ?
            </router-link>
            <br>
            <router-link to="/auth/register">
              Pas encore de compte ? S'inscrire
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
import { useRouter, useRoute } from 'vue-router'
import type { LoginCredentials } from '@/types/auth'

export default defineComponent({
  name: 'Login',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const form = ref<any>(null)
    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const showPassword = ref(false)
    const loading = ref(false)

    const emailRules = [
      (v: string) => !!v || 'L\'email est requis',
      (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    const passwordRules = [
      (v: string) => !!v || 'Le mot de passe est requis',
      (v: string) => v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères'
    ]

    const handleSubmit = async () => {
      if (!form.value?.validate()) return

      loading.value = true

      try {
        const credentials: LoginCredentials = {
          email: email.value,
          password: password.value,
          rememberMe: rememberMe.value
        }

        await store.dispatch('auth/login', credentials)

        const redirectPath = route.query.redirect as string || '/dashboard'
        router.push(redirectPath)
      } catch (error) {
        console.error('Erreur de connexion:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      email,
      password,
      rememberMe,
      showPassword,
      loading,
      emailRules,
      passwordRules,
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