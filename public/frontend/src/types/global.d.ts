declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.json' {
  const content: any
  export default content
}

// Déclarations globales
declare interface Window {
  // Ajoutez ici les propriétés globales de window si nécessaire
  [key: string]: any
}

declare type Nullable<T> = T | null

declare type NonNullable<T> = T extends null | undefined ? never : T

declare interface ImportMetaEnv {
  VITE_API_URL: string
  [key: string]: string | undefined
} 