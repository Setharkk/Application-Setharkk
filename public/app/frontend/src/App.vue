<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav>
      <router-link to="/">Accueil</router-link> |
      <router-link to="/profile">Profil</router-link> |
      <router-link to="/settings">Paramètres</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/runtime-core'
import { useStore } from 'vuex'
import type { RootState } from './store'

export default defineComponent({
  name: 'App',
  setup() {
    const store = useStore<RootState>()
    
    const isDarkMode = computed(() => store.state.darkMode)

    return {
      isDarkMode
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

.dark-mode nav a {
  color: #ffffff;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.dark-mode nav a.router-link-exact-active {
  color: #42b983;
}
</style> 