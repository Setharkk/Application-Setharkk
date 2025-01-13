declare module 'vue-router' {
  export function useRouter(): any
  export function useRoute(): any
  export function createRouter(options: any): any
  export function createWebHistory(base?: string): any
  export interface RouteRecordRaw {
    path: string
    component: any
    name?: string
    children?: RouteRecordRaw[]
    redirect?: string | { name: string }
    meta?: {
      requiresAuth?: boolean
      [key: string]: any
    }
  }
  export interface Router {
    push(to: string): Promise<void>
  }
} 