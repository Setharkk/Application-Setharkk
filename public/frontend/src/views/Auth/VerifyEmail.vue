<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center py-7">
            <h2>Vérification de l'email</h2>
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-3">Vérification de votre email...</p>
            </div>
            <div v-else-if="verified" class="text-center">
              <v-icon color="success" size="48">mdi-check-circle</v-icon>
              <p class="mt-3">Votre email a été vérifié avec succès !</p>
            </div>
            <div v-else class="text-center">
              <v-icon color="error" size="48">mdi-alert-circle</v-icon>
              <p class="mt-3">{{ error || "Une erreur est survenue lors de la vérification de votre email." }}</p>
            </div>
          </v-card-text>
          <v-card-actions class="justify-center pb-6">
            <v-btn
              v-if="verified"
              color="primary"
              @click="goToLogin"
            >
              Se connecter
            </v-btn>
            <v-btn
              v-else
              color="primary"
              @click="resendVerification"
              :loading="resending"
            >
              Renvoyer l'email
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'VerifyEmail',
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(true)
    const verified = ref(false)
    const error = ref('')
    const resending = ref(false)
    
    const verifyEmail = async () => {
      try {
        const token = route.params.token as string
        await store.dispatch('auth/verifyEmail', token)
        verified.value = true
        error.value = ''
      } catch (err: any) {
        error.value = err.message || "Une erreur est survenue lors de la vérification."
        verified.value = false
      } finally {
        loading.value = false
      }
    }
    
    const resendVerification = async () => {
      resending.value = true
      try {
        await store.dispatch('auth/resendVerification')
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message: 'Un nouvel email de vérification a été envoyé.'
        })
      } catch (err: any) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: err.message || "Erreur lors de l'envoi de l'email."
        })
      } finally {
        resending.value = false
      }
    }
    
    const goToLogin = () => {
      router.push('/auth/login')
    }
    
    onMounted(() => {
      verifyEmail()
    })
    
    return {
      loading,
      verified,
      error,
      resending,
      resendVerification,
      goToLogin
    }
  }
})
</script> 