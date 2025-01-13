declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// Déclaration pour les plugins
declare module '@/plugins/toast' {
  import { Plugin } from 'vue'
  export const VueToastPlugin: Plugin
  export interface ToastOptions {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    timeout?: number
  }
}

// Déclaration pour process.env
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    VUE_APP_API_URL?: string
    BASE_URL: string
  }
} 