import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import store from '@/store'

export const authGuard = (
  to: RouteLocationNormalized,
  _: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const requiresAuth = !to.meta.guest

  if (requiresAuth && !isAuthenticated) {
    store.dispatch('notifications/addNotification', {
      type: 'warning',
      message: 'Veuillez vous connecter pour accéder à cette page.',
      timeout: 3000
    })
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  if (to.meta.guest && isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
}

export const roleGuard = (roles: string[]) => {
  return (
    _: RouteLocationNormalized,
    __: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const user = store.getters['auth/currentUser']
    
    if (!user || !roles.includes(user.role)) {
      store.dispatch('notifications/addNotification', {
        type: 'error',
        message: 'Accès non autorisé.',
        timeout: 3000
      })
      next({ name: 'Dashboard' })
      return
    }

    next()
  }
} 