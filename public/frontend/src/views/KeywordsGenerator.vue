<template>
  <div class="keywords-generator">
    <h1>Générateur de Mots-clés et Tags</h1>
    
    <div class="input-section">
      <textarea 
        v-model="content" 
        placeholder="Entrez votre contenu ici..."
        class="content-input"
      ></textarea>
      
      <div class="options">
        <div class="option-group">
          <label for="language">Langue :</label>
          <select id="language" v-model="language">
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>
        
        <div class="option-group">
          <label for="keywordCount">Nombre de mots-clés :</label>
          <input id="keywordCount" type="number" v-model="keywordCount" min="1" max="20">
        </div>
      </div>

      <button @click="generateKeywords" class="generate-btn">
        <i class="fas fa-magic"></i> Générer
      </button>
    </div>

    <div v-if="keywords.length" class="results-section">
      <div class="keywords-list">
        <h2>Mots-clés générés</h2>
        <div class="tags">
          <span 
            v-for="(keyword, index) in keywords" 
            :key="index"
            class="tag"
            :style="{ backgroundColor: getTagColor(index) }"
          >
            {{ keyword }}
            <button @click="removeKeyword(index)" class="remove-tag">×</button>
          </span>
        </div>
      </div>

      <div class="actions">
        <button @click="copyToClipboard" class="action-btn">
          <i class="fas fa-copy"></i> Copier
        </button>
        <button @click="saveKeywords" class="action-btn primary">
          <i class="fas fa-save"></i> Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'KeywordsGenerator',
  
  setup() {
    const content = ref('');
    const language = ref('fr');
    const keywordCount = ref(10);
    const keywords = ref([]);

    const generateKeywords = async () => {
      try {
        const response = await axios.post('/api/keywords/generate', {
          content: content.value,
          language: language.value,
          count: keywordCount.value
        });
        keywords.value = response.data.keywords;
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
      }
    };

    const removeKeyword = (index) => {
      keywords.value.splice(index, 1);
    };

    const copyToClipboard = () => {
      const text = keywords.value.join(', ');
      navigator.clipboard.writeText(text);
    };

    const saveKeywords = async () => {
      try {
        await axios.post('/api/keywords/save', {
          keywords: keywords.value,
          language: language.value
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    };

    const getTagColor = (index) => {
      const colors = [
        '#4C6EF5', '#40C057', '#F59F00', '#E64980',
        '#7950F2', '#15AABF', '#FA5252', '#82C91E'
      ];
      return colors[index % colors.length];
    };

    return {
      content,
      language,
      keywordCount,
      keywords,
      generateKeywords,
      removeKeyword,
      copyToClipboard,
      saveKeywords,
      getTagColor
    };
  }
};
</script>

<style lang="scss" scoped>
.keywords-generator {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    font-size: 28px;
    margin-bottom: 30px;
    color: #e4e6eb;
  }

  .input-section {
    background: #2d3748;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;

    .content-input {
      width: 100%;
      height: 150px;
      padding: 15px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      background: #1a1c23;
      color: #e4e6eb;
      font-size: 14px;
      resize: vertical;
      margin-bottom: 20px;

      &:focus {
        outline: none;
        border-color: #4C6EF5;
      }
    }

    .options {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      .option-group {
        display: flex;
        align-items: center;
        gap: 10px;

        label {
          color: #e4e6eb;
          font-size: 14px;
        }

        select, input {
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          background: #1a1c23;
          color: #e4e6eb;
          font-size: 14px;

          &:focus {
            outline: none;
            border-color: #4C6EF5;
          }
        }
      }
    }
  }

  .results-section {
    background: #2d3748;
    padding: 20px;
    border-radius: 10px;

    h2 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #e4e6eb;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;

      .tag {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 20px;
        color: white;
        font-size: 14px;

        .remove-tag {
          background: none;
          border: none;
          color: white;
          margin-left: 8px;
          cursor: pointer;
          font-size: 18px;
          opacity: 0.7;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
  }

  button {
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &.generate-btn {
      width: 100%;
      background: linear-gradient(135deg, #4C6EF5, #3B5BDB);
      color: white;
      margin-top: 20px;

      &:hover {
        background: linear-gradient(135deg, #3B5BDB, #364FC7);
      }
    }

    &.action-btn {
      background: #1a1c23;
      color: #e4e6eb;
      border: 1px solid rgba(255,255,255,0.1);

      &:hover {
        background: #2d3748;
      }

      &.primary {
        background: linear-gradient(135deg, #4C6EF5, #3B5BDB);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #3B5BDB, #364FC7);
        }
      }

      i {
        margin-right: 8px;
      }
    }
  }
}
</style> 