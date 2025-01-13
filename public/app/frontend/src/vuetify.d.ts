declare module 'vuetify/lib/framework' {
  import 'vuetify/types'
  import { Framework } from 'vuetify'
  const Vuetify: Framework
  export default Vuetify
}

declare module 'vuetify/lib/components' {
  export * from 'vuetify/types/lib/components'
}

declare module 'vuetify/lib/directives' {
  export * from 'vuetify/types/lib/directives'
}

declare module 'vuetify/iconsets/mdi' {
  export const mdi: any
  export const aliases: any
} 