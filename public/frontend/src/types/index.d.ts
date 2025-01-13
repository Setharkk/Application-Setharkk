import { Store } from 'vuex'
import { Router } from 'vue-router'
import { MenuItem, FooterLink, NavigationState } from './navigation'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<any>
    $router: Router
    $toast: {
      success(message: string): void
      error(message: string): void
      warning(message: string): void
      info(message: string): void
    }
  }
}

// Types pour le state Vuex
export interface RootState {
  loading: boolean
  error: Error | null
  theme: {
    dark: boolean
  }
  navigation: NavigationState
}

// Types pour les réponses API
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  role: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  read: boolean
  created_at: string
}

export interface Campaign {
  id: number
  name: string
  type: string
  status: 'active' | 'paused' | 'completed'
  budget: number
  start_date: string
  end_date: string
  description?: string
}

export interface SeoAnalysis {
  id: number
  url: string
  score: number
  recommendations: Array<{
    type: string
    message: string
    importance: 'high' | 'medium' | 'low'
  }>
  created_at: string
}

export interface KeywordAnalysis {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  competition: number
  trend: Array<{
    date: string
    volume: number
  }>
}

// Types pour les configurations
export interface IntegrationConfig {
  id: number
  type: string
  name: string
  enabled: boolean
  credentials: Record<string, any>
  settings: Record<string, any>
  last_sync?: string
}

// Types pour les erreurs
export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}

// Types pour les événements
export interface AppEvent {
  type: string
  payload: any
  timestamp: number
}

// Types pour les thèmes
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  error: string
  info: string
  success: string
  warning: string
  background: string
  surface: string
}

export type { MenuItem, FooterLink, NavigationState } 