/* eslint-disable */
declare module '*.vue' {
  import type { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $emit: (event: string, ...args: any[]) => void
    $store: any
    $router: any
    $route: any
  }
}

declare module 'vuex' {
  export * from 'vuex/types/index.d.ts'
  export * from 'vuex/types/helpers.d.ts'
  export * from 'vuex/types/logger.d.ts'
  export * from 'vuex/types/vue.d.ts'
}

declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router.d.ts'
} 