<template>
  <div class="home">
    <section class="hero">
      <h1>Bienvenue sur Setharkk</h1>
      <p class="subtitle">Votre assistant intelligent pour l'automatisation et la prospection</p>
    </section>

    <section class="features">
      <div class="feature-card">
        <h3>Chat Intelligent</h3>
        <p>Interagissez naturellement avec notre assistant pour toutes vos tâches</p>
        <router-link to="/chat" class="feature-link">Commencer une conversation</router-link>
      </div>

      <div class="feature-card">
        <h3>Gestion de la Mémoire</h3>
        <p>Stockez et retrouvez facilement vos informations importantes</p>
        <router-link to="/memory" class="feature-link">Accéder à la mémoire</router-link>
      </div>

      <div class="feature-card">
        <h3>Optimisation SEO</h3>
        <p>Améliorez votre visibilité en ligne avec nos outils SEO</p>
        <router-link to="/seo" class="feature-link">Analyser votre SEO</router-link>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Home'
})
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.feature-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.feature-link:hover {
  background-color: var(--secondary-color);
}
</style> 