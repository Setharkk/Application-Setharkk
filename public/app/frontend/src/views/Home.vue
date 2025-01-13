<template>
  <div class="home">
    <h1>Bienvenue sur l'Application Setharkk</h1>
    <div class="content">
      <p>Cette application est en cours de développement.</p>
      <div class="features">
        <h2>Fonctionnalités disponibles :</h2>
        <ul>
          <li>Gestion du profil</li>
          <li>Paramètres de l'application</li>
          <li>Mode sombre</li>
          <li>Multilingue (FR/EN)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'Home'
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.content {
  margin-top: 20px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.features {
  margin-top: 20px;
}

h1 {
  color: #2c3e50;
  text-align: center;
}

h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

li:last-child {
  border-bottom: none;
}
</style> 