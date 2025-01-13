declare module 'vuex' {
  export function useStore(): any
  export function createStore(options: any): any
  export interface Store<S> {
    state: S
    commit: (type: string, payload?: any) => void
    dispatch: (type: string, payload?: any) => Promise<any>
  }
} 