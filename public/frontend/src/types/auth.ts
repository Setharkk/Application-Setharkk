export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  passwordConfirmation: string
}

export interface UpdateProfileData {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  newPasswordConfirmation?: string
  avatar?: File
} 