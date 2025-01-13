export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
  timeout?: number
  dismissible?: boolean
  read: boolean
}

export interface NotificationsState {
  notifications: Notification[]
} 