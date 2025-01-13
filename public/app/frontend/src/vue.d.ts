import '@vue/runtime-core'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: any
    $router: any
    $route: any
  }
}

declare module 'vue' {
  export * from '@vue/runtime-core'
  export * from '@vue/reactivity'
  export * from '@vue/runtime-dom'
  
  export const defineProps: any
  export const defineEmits: any
  export const defineExpose: any
  export const withDefaults: any
} 