import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { Router } from 'vue-router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<any>
    $router: Router
  }
}

declare module 'vue' {
  export interface Ref<T = any> {
    value: T
  }
  
  export type ComputedRef<T = any> = {
    readonly value: T
  }
} 