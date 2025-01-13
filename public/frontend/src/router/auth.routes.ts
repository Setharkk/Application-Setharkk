import type { RouteRecordRaw } from 'vue-router'

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: {
      guest: true,
      title: 'Connexion'
    }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/Auth/Register.vue'),
    meta: {
      guest: true,
      title: 'Inscription'
    }
  },
  {
    path: '/auth/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/Auth/ForgotPassword.vue'),
    meta: {
      guest: true,
      title: 'Mot de passe oublié'
    }
  },
  {
    path: '/auth/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('@/views/Auth/ResetPassword.vue'),
    meta: {
      guest: true,
      title: 'Réinitialisation du mot de passe'
    },
    props: true
  },
  {
    path: '/auth/verify-email/:token',
    name: 'VerifyEmail',
    component: () => import('@/views/Auth/VerifyEmail.vue'),
    meta: {
      guest: true,
      title: 'Vérification de l\'email'
    },
    props: true
  }
]

export default authRoutes 