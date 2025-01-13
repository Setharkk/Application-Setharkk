<template>
  <div class="memory">
    <h2>Gestion de la Mémoire</h2>
    <div class="memory-container">
      <div class="search-container">
        <input type="text" placeholder="Rechercher dans la mémoire..." />
        <button>Rechercher</button>
      </div>
      <div class="memory-items">
        <div class="memory-item">
          <h3>Information #1</h3>
          <p>Contenu de l'information stockée...</p>
          <div class="item-actions">
            <button class="secondary">Modifier</button>
            <button class="danger">Supprimer</button>
          </div>
        </div>
      </div>
      <button class="add-button">Ajouter une nouvelle information</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Memory'
})
</script>

<style scoped>
.memory {
  max-width: 800px;
  margin: 0 auto;
}

.memory-container {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
  margin-top: 1rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-container input {
  flex: 1;
}

.memory-items {
  display: grid;
  gap: 1rem;
}

.memory-item {
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: var(--border-radius);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.secondary {
  background-color: #6c757d;
}

.danger {
  background-color: #dc3545;
}

.add-button {
  margin-top: 1rem;
  width: 100%;
}
</style> 