import type { AxiosError, AxiosResponse } from 'axios'
import type { ApiError, ApiInterceptorHandler, ApiSuccessHandler } from '@/types/api'
import store from '@/store'
import router from '@/router'

export const requestInterceptor = (config: any) => {
  const token = (store as any).state.auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

export const responseInterceptor: ApiSuccessHandler = (response: AxiosResponse) => {
  return response
}

export const errorInterceptor: ApiInterceptorHandler = async (error: AxiosError<ApiError>) => {
  const errorMessage = error.response?.data?.message || error.message
  const status = error.response?.status

  // Gestion des erreurs d'authentification
  if (status === 401) {
    store.dispatch('auth/logout')
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      timeout: 5000
    })
    router.push('/auth/login')
  }

  // Gestion des erreurs d'autorisation
  else if (status === 403) {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.',
      timeout: 5000
    })
  }

  // Gestion des erreurs de validation
  else if (status === 422) {
    const details = error.response?.data?.details
    if (details) {
      Object.values(details).forEach(message => {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message: message as string,
          timeout: 5000
        })
      })
    }
  }

  // Gestion des erreurs serveur
  else if (status === 500) {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
      timeout: 5000
    })
  }

  // Gestion des erreurs de réseau
  else if (!error.response) {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      timeout: 5000
    })
  }

  // Autres erreurs
  else {
    store.dispatch('notifications/addNotification', {
      type: 'error',
      message: errorMessage,
      timeout: 5000
    })
  }

  return Promise.reject(new Error(errorMessage))
} 