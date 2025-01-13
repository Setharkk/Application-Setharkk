export interface MenuItem {
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

export interface FooterLink {
  text: string
  to: string
}

export interface NavigationState {
  drawer: boolean | null
  userMenu: boolean
  notificationsDialog: boolean
} 