import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import api from './api'
import { VueToastPlugin } from '@/plugins/toast'

// Styles globaux
import './assets/styles/main.css'
import './styles/main.scss'

const app = createApp(App)

// Initialisation de l'API
api.init()

// Gestionnaire d'erreurs global
app.config.errorHandler = (err: unknown, vm: any, info: string) => {
  console.error('Erreur globale:', err)
  if (err instanceof Error) {
    store.dispatch('setError', {
      message: err.message,
      stack: err.stack,
      info: info
    })
  }
  
  // Notification à l'utilisateur
  if (vm.$toast) {
    vm.$toast.error('Une erreur est survenue. Veuillez réessayer.')
  }
}

// Gestionnaire d'avertissements
app.config.warnHandler = (msg: string, _: any, trace: string) => {
  console.warn('Avertissement:', msg)
  console.warn('Trace:', trace)
}

// Plugins
app.use(store)
app.use(router)
app.use(vuetify)
app.use(VueToastPlugin, {
  position: 'top-right',
  timeout: 5000
})

// Montage de l'application
app.mount('#app') 