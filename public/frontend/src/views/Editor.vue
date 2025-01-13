<template>
  <div class="editor">
    <div class="toolbar">
      <button @click="saveContent" :disabled="!hasUnsavedChanges">
        Sauvegarder
      </button>
      <button @click="getSuggestions">
        Obtenir des suggestions
      </button>
    </div>
    
    <div class="content-area">
      <textarea
        v-model="content"
        placeholder="Commencez à écrire votre contenu ici..."
        @input="handleInput"
      ></textarea>
      
      <div v-if="suggestions.length" class="suggestions">
        <h3>Suggestions</h3>
        <ul>
          <li v-for="(suggestion, index) in suggestions" :key="index">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'EditorView',
  data() {
    return {
      content: ''
    }
  },
  computed: {
    ...mapState('editor', ['suggestions']),
    ...mapGetters('editor', ['hasUnsavedChanges'])
  },
  methods: {
    ...mapActions('editor', ['saveContent', 'getSuggestions']),
    handleInput() {
      // Vous pouvez ajouter ici une logique de debounce pour les suggestions automatiques
    }
  }
}
</script>

<style lang="scss" scoped>
.editor {
  padding: 20px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  
  .toolbar {
    margin-bottom: 20px;
    
    button {
      margin-right: 10px;
      padding: 8px 16px;
      background: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      
      &:disabled {
        background: #a8d5c2;
        cursor: not-allowed;
      }
      
      &:hover:not(:disabled) {
        background: #3aa876;
      }
    }
  }
  
  .content-area {
    display: flex;
    gap: 20px;
    flex: 1;
    
    textarea {
      flex: 1;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
      font-family: 'Arial', sans-serif;
      font-size: 16px;
      line-height: 1.5;
      
      &:focus {
        outline: none;
        border-color: #42b983;
      }
    }
    
    .suggestions {
      width: 300px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      
      h3 {
        margin-bottom: 15px;
        color: #42b983;
      }
      
      ul {
        list-style: none;
        padding: 0;
        
        li {
          margin-bottom: 10px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      }
    }
  }
}
</style> 