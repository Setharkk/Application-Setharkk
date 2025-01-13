import { Store } from 'vuex'

interface User {
  username: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface RootState {
  auth: AuthState
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<RootState>
  }
}

export { User, AuthState, RootState } 