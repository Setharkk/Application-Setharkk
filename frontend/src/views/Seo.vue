<template>
  <div class="seo">
    <h2>Optimisation SEO</h2>
    <div class="seo-container">
      <div class="url-input">
        <input type="text" placeholder="Entrez l'URL à analyser..." />
        <button>Analyser</button>
      </div>
      <div class="seo-results">
        <div class="seo-score">
          <h3>Score SEO</h3>
          <div class="score">85/100</div>
        </div>
        <div class="seo-recommendations">
          <h3>Recommandations</h3>
          <ul>
            <li class="good">✓ Les balises meta sont bien configurées</li>
            <li class="warning">⚠ Optimisez les images pour de meilleures performances</li>
            <li class="error">✗ Le site manque de contenu original</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SEO'
})
</script>

<style scoped>
.seo {
  max-width: 800px;
  margin: 0 auto;
}

.seo-container {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
  margin-top: 1rem;
}

.url-input {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.url-input input {
  flex: 1;
}

.seo-results {
  display: grid;
  gap: 2rem;
}

.seo-score {
  text-align: center;
}

.score {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 1rem 0;
}

.seo-recommendations ul {
  list-style: none;
  padding: 0;
}

.seo-recommendations li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.good {
  color: #28a745;
}

.warning {
  color: #ffc107;
}

.error {
  color: #dc3545;
}
</style> 