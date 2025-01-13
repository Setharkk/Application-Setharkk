import { App } from 'vue'
import { Store } from 'vuex'
import type { RootState } from '@/types'

export default {
  install: (app: App, store: Store<RootState>) => {
    app.config.globalProperties.$toast = {
      success(message: string) {
        store.dispatch('notifications/addNotification', {
          type: 'success',
          message,
          timeout: 3000
        })
      },
      error(message: string) {
        store.dispatch('notifications/addNotification', {
          type: 'error',
          message,
          timeout: 5000
        })
      },
      info(message: string) {
        store.dispatch('notifications/addNotification', {
          type: 'info',
          message,
          timeout: 3000
        })
      },
      warning(message: string) {
        store.dispatch('notifications/addNotification', {
          type: 'warning',
          message,
          timeout: 4000
        })
      }
    }
  }
} 