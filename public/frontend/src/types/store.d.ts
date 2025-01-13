import type { AuthState } from './auth'
import type { NotificationsState } from './notifications'
import type { SettingsState } from './settings'

export interface RootState {
  auth: AuthState
  notifications: NotificationsState
  settings: SettingsState
  theme: {
    dark: boolean
  }
} 