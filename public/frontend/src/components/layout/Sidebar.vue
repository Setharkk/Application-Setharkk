<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-chevron-left"
        title="Réduire"
        @click.stop="rail = !rail"
      />
    </v-list>

    <v-divider />

    <v-list
      nav
      density="compact"
    >
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :value="item.value"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :subtitle="item.subtitle"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Sidebar',

  setup() {
    const drawer = ref(true)
    const rail = ref(false)

    const menuItems = [
      {
        title: 'Tableau de bord',
        value: 'home',
        to: '/',
        icon: 'mdi-view-dashboard'
      },
      {
        title: 'Marketing',
        value: 'marketing',
        to: '/marketing',
        icon: 'mdi-bullhorn'
      },
      {
        title: 'SEO',
        value: 'seo',
        to: '/seo',
        icon: 'mdi-magnify'
      },
      {
        title: 'Chat',
        value: 'chat',
        to: '/chat',
        icon: 'mdi-message'
      },
      {
        title: 'Éditeur',
        value: 'editor',
        to: '/editor',
        icon: 'mdi-pencil'
      },
      {
        title: 'Mots-clés',
        value: 'keywords',
        to: '/keywords',
        icon: 'mdi-key-variant'
      },
      {
        title: 'Intégrations',
        value: 'integrations',
        to: '/integrations',
        icon: 'mdi-puzzle'
      }
    ]

    return {
      drawer,
      rail,
      menuItems
    }
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  transition: width 0.2s ease-out;
}
</style> 