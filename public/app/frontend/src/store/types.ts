export interface RootState {
  version: string
}

export interface User {
  id: string
  username: string
  email: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface NotificationsState {
  items: Notification[]
} 