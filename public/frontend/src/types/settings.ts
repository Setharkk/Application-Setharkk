export interface Settings {
  emailNotifications: boolean
  marketingEmails: boolean
  language: string
  timezone: string
  defaultView: string
  twoFactorAuth: boolean
  sessionTimeout: boolean
  theme: {
    dark: boolean
    customColors: boolean
  }
}

export interface Language {
  name: string
  code: string
}

export interface View {
  name: string
  value: string
  icon: string
}

export interface TwoFactorResponse {
  qrCode: string
  secret: string
}

export interface SettingsState {
  settings: Settings | null
  loading: boolean
  error: string | null
} 