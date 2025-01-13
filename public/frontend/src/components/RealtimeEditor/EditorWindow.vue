<template>
  <div class="editor-window">
    <div class="editor-container">
      <div class="editor-main">
        <div class="editor-toolbar">
          <button
            v-for="action in editorActions"
            :key="action.id"
            @click="action.handler"
            :class="['toolbar-btn', { active: action.isActive }]"
            :title="action.title"
          >
            <i :class="['fas', action.icon]"></i>
          </button>
        </div>

        <div class="editor-content">
          <textarea
            v-model="content"
            class="content-area"
            :placeholder="isLoading ? 'Chargement...' : 'Commencez à écrire...'"
            :disabled="isLoading"
            @input="handleInput"
            ref="editorTextarea"
          ></textarea>

          <div v-if="isLoading" class="editor-overlay">
            <div class="spinner"></div>
          </div>
        </div>

        <div class="editor-statusbar">
          <div class="word-count">
            {{ wordCount }} mots
          </div>
          <button
            @click="analyzeContent"
            :class="['analyze-btn', { loading: isAnalyzing }]"
            :disabled="isAnalyzing || !content.trim()"
          >
            <i class="fas" :class="isAnalyzing ? 'fa-spinner fa-spin' : 'fa-chart-bar'"></i>
            {{ isAnalyzing ? 'Analyse en cours...' : 'Analyser' }}
          </button>
        </div>
      </div>

      <div v-if="analysis" class="analysis-panel" :class="{ 'panel-open': showAnalysis }">
        <div class="panel-header">
          <h3>Analyse du contenu</h3>
          <button @click="toggleAnalysis" class="toggle-btn">
            <i :class="['fas', showAnalysis ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
          </button>
        </div>

        <div class="panel-content">
          <section class="analysis-section">
            <h4>Lisibilité</h4>
            <div class="score-container">
              <div class="score-header">
                <span>Score: {{ analysis.readability.score }}/100</span>
                <span :class="analysis.readability.level.class">
                  {{ analysis.readability.level.text }}
                </span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress"
                  :style="{ width: `${analysis.readability.score}%` }"
                  :class="getProgressClass(analysis.readability.score)"
                ></div>
              </div>
            </div>
            <ul v-if="analysis.readability.suggestions.length" class="suggestions-list">
              <li v-for="(suggestion, index) in analysis.readability.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </section>

          <section class="analysis-section">
            <h4>SEO</h4>
            <div class="score-container">
              <div class="score-header">
                <span>Score: {{ analysis.seo.score }}/100</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress"
                  :style="{ width: `${analysis.seo.score}%` }"
                  :class="getProgressClass(analysis.seo.score)"
                ></div>
              </div>
            </div>
            <ul v-if="analysis.seo.suggestions.length" class="suggestions-list">
              <li v-for="(suggestion, index) in analysis.seo.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </section>

          <section class="analysis-section">
            <h4>Grammaire et Style</h4>
            <div v-if="analysis.grammar.errors.length" class="grammar-errors">
              <h5>Erreurs détectées:</h5>
              <ul class="error-list">
                <li v-for="(error, index) in analysis.grammar.errors" :key="index">
                  {{ error }}
                </li>
              </ul>
            </div>
            <div v-if="analysis.grammar.suggestions.length" class="grammar-suggestions">
              <h5>Suggestions:</h5>
              <ul class="suggestions-list">
                <li v-for="(suggestion, index) in analysis.grammar.suggestions" :key="index">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useEditorController } from './EditorController';
import debounce from 'lodash/debounce';

export default {
  name: 'EditorWindow',
  setup() {
    const content = ref('');
    const isLoading = ref(true);
    const isAnalyzing = ref(false);
    const analysis = ref(null);
    const showAnalysis = ref(true);
    const editorTextarea = ref(null);
    const editorController = useEditorController();

    const wordCount = computed(() => {
      return content.value.trim() ? content.value.trim().split(/\s+/).length : 0;
    });

    const editorActions = [
      {
        id: 'bold',
        icon: 'fa-bold',
        title: 'Gras',
        handler: () => applyFormat('**', '**')
      },
      {
        id: 'italic',
        icon: 'fa-italic',
        title: 'Italique',
        handler: () => applyFormat('_', '_')
      },
      {
        id: 'heading',
        icon: 'fa-heading',
        title: 'Titre',
        handler: () => applyFormat('### ', '')
      }
    ];

    const initEditor = async () => {
      try {
        const response = await editorController.initializeEditor();
        content.value = response.data?.content || '';
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const debouncedUpdate = debounce(async (newContent) => {
      try {
        await editorController.updateContent(newContent);
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      }
    }, editorController.DEBOUNCE_DELAY);

    const handleInput = () => {
      debouncedUpdate(content.value);
    };

    const analyzeContent = async () => {
      if (isAnalyzing.value || !content.value.trim()) return;

      isAnalyzing.value = true;
      try {
        const response = await editorController.analyzeContent(content.value);
        analysis.value = editorController.formatAnalysis(response.data);
        showAnalysis.value = true;
      } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
      } finally {
        isAnalyzing.value = false;
      }
    };

    const toggleAnalysis = () => {
      showAnalysis.value = !showAnalysis.value;
    };

    const getProgressClass = (score) => {
      if (score >= 80) return 'bg-green-500';
      if (score >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    const applyFormat = (prefix, suffix) => {
      if (!editorTextarea.value) return;

      const textarea = editorTextarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.value.substring(start, end);
      const beforeText = content.value.substring(0, start);
      const afterText = content.value.substring(end);

      content.value = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
      
      // Restore cursor position
      textarea.focus();
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    };

    onMounted(() => {
      initEditor();
    });

    onBeforeUnmount(() => {
      debouncedUpdate.cancel();
    });

    return {
      content,
      isLoading,
      isAnalyzing,
      analysis,
      showAnalysis,
      wordCount,
      editorActions,
      editorTextarea,
      handleInput,
      analyzeContent,
      toggleAnalysis,
      getProgressClass
    };
  }
};
</script>

<style lang="scss" scoped>
.editor-window {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-container {
  display: flex;
  height: 100%;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;

  .toolbar-btn {
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;

    &:hover {
      background: #e5e7eb;
    }

    &.active {
      background: #e5e7eb;
    }
  }
}

.editor-content {
  flex: 1;
  position: relative;

  .content-area {
    width: 100%;
    height: 100%;
    padding: 1rem;
    resize: none;
    border: none;
    font-family: monospace;
    color: #1f2937;

    &:focus {
      outline: none;
    }
  }

  .editor-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 4px solid #3b82f6;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

.editor-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;

  .word-count {
    font-size: 0.875rem;
    color: #4b5563;
  }

  .analyze-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border-radius: 0.25rem;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    &.loading {
      background: #60a5fa;
    }
  }
}

.analysis-panel {
  width: 20rem;
  border-left: 1px solid #e5e7eb;
  background: #f9fafb;
  transform: translateX(0);
  transition: transform 0.3s;

  &:not(.panel-open) {
    transform: translateX(100%);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: white;

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .toggle-btn {
      padding: 0.5rem;
      border-radius: 0.25rem;

      &:hover {
        background: #f3f4f6;
      }
    }
  }

  .panel-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    max-height: calc(100vh - 10rem);
  }
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  h4 {
    font-size: 1.125rem;
    font-weight: 500;
  }

  h5 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 0.5rem;
  }
}

.score-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .score-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .progress-bar {
    width: 100%;
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;

    .progress {
      height: 100%;
      transition: width 0.3s, background-color 0.3s;

      &.bg-green-500 { background: #22c55e; }
      &.bg-yellow-500 { background: #eab308; }
      &.bg-red-500 { background: #ef4444; }
    }
  }
}

.suggestions-list, .error-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;

  li {
    padding-left: 1rem;
    border-left-width: 2px;
  }
}

.suggestions-list li {
  border-left-color: #60a5fa;
}

.error-list li {
  border-left-color: #ef4444;
  color: #dc2626;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 