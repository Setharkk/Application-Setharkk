<template>
  <div class="not-found">
    <div class="error-content">
      <h1>404</h1>
      <h2>Page non trouvée</h2>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <router-link to="/" class="home-link">
        <i class="fas fa-home"></i>
        Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: 2rem;
}

.error-content {
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  color: #2c3e50;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: #42b983;
  margin: 1rem 0;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.home-link:hover {
  background: #3aa876;
}

i {
  font-size: 1.2em;
}
</style> 