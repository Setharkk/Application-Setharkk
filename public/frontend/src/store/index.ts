import { createStore } from 'vuex'
import type { RootState } from '@/types'
import auth from './modules/auth'
import notifications from './modules/notifications'

export default createStore<RootState>({
  modules: {
    auth,
    notifications
  }
}) 