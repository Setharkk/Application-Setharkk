<template>
  <div class="home">
    <h1>Bienvenue sur Setharkk</h1>
    <div class="features">
      <div class="feature">
        <h2>Éditeur</h2>
        <p>Créez et éditez votre contenu avec des suggestions intelligentes.</p>
        <router-link to="/editor" class="btn">Commencer</router-link>
      </div>
      <div class="feature">
        <h2>SEO</h2>
        <p>Analysez et optimisez votre contenu pour les moteurs de recherche.</p>
        <router-link to="/seo" class="btn">Analyser</router-link>
      </div>
      <div class="feature">
        <h2>Chat</h2>
        <p>Discutez avec notre assistant IA pour obtenir de l'aide.</p>
        <router-link to="/chat" class="btn">Discuter</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style lang="scss" scoped>
.home {
  padding: 20px;
  
  h1 {
    margin-bottom: 40px;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
    
    .feature {
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      text-align: center;
      
      h2 {
        color: #42b983;
        margin-bottom: 15px;
      }
      
      p {
        margin-bottom: 20px;
      }
      
      .btn {
        display: inline-block;
        padding: 10px 20px;
        background: #42b983;
        color: white;
        border-radius: 4px;
        text-decoration: none;
        transition: background 0.3s;
        
        &:hover {
          background: #3aa876;
        }
      }
    }
  }
}
</style>
