<script>
import { ref } from 'vue';
import { useSEOController } from './SEOController';

export default {
  name: 'SEOWindow',
  setup() {
    const url = ref('');
    const isAnalyzing = ref(false);
    const analysisResults = ref(null);
    const seoController = useSEOController();

    const analyzeURL = async () => {
      if (!url.value.trim() || isAnalyzing.value) return;

      isAnalyzing.value = true;
      try {
        const response = await seoController.analyzePage(url.value);
        analysisResults.value = seoController.formatAnalysisResults(response.data);
      } catch (error) {
        console.error('Erreur lors de l\'analyse SEO:', error);
      } finally {
        isAnalyzing.value = false;
      }
    };

    const getStatusColor = (status) => {
      return status === 'success' ? 'text-green-500' : 'text-red-500';
    };

    const optimizePage = async () => {
      if (!analysisResults.value || isAnalyzing.value) return;

      isAnalyzing.value = true;
      try {
        const response = await seoController.optimizePage({
          url: url.value,
          currentData: analysisResults.value
        });
        analysisResults.value = seoController.formatAnalysisResults(response.data);
      } catch (error) {
        console.error('Erreur lors de l\'optimisation SEO:', error);
      } finally {
        isAnalyzing.value = false;
      }
    };

    return {
      url,
      isAnalyzing,
      analysisResults,
      analyzeURL,
      optimizePage,
      getStatusColor
    };
  }
};
</script>

<template>
  <div class="seo-window p-4">
    <div class="mb-4">
      <input
        v-model="url"
        type="url"
        placeholder="Entrez l'URL à analyser"
        class="w-full p-2 border rounded"
        :disabled="isAnalyzing"
      />
      <button
        @click="analyzeURL"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="isAnalyzing"
      >
        {{ isAnalyzing ? 'Analyse en cours...' : 'Analyser' }}
      </button>
    </div>

    <div v-if="analysisResults" class="results">
      <div class="score mb-4">
        <h2 class="text-xl font-bold">Score SEO: {{ analysisResults.score }}/100</h2>
        <div class="w-full bg-gray-200 rounded h-4 mt-2">
          <div
            class="bg-blue-500 rounded h-4"
            :style="{ width: `${analysisResults.score}%` }"
          ></div>
        </div>
      </div>

      <div class="recommendations mb-4">
        <h3 class="text-lg font-semibold mb-2">Recommandations</h3>
        <ul class="list-disc pl-5">
          <li v-for="(rec, index) in analysisResults.recommendations" :key="index" class="mb-1">
            {{ rec }}
          </li>
        </ul>
      </div>

      <div class="details">
        <h3 class="text-lg font-semibold mb-2">Détails de l'analyse</h3>
        
        <div class="meta-section mb-4">
          <h4 class="font-medium">Méta-données</h4>
          <div class="pl-4">
            <p>
              Titre:
              <span :class="getStatusColor(analysisResults.details.meta.title.status)">
                {{ analysisResults.details.meta.title.value }}
              </span>
            </p>
            <p>
              Description:
              <span :class="getStatusColor(analysisResults.details.meta.description.status)">
                {{ analysisResults.details.meta.description.value }}
              </span>
            </p>
            <p>
              Mots-clés:
              <span :class="getStatusColor(analysisResults.details.meta.keywords.status)">
                {{ analysisResults.details.meta.keywords.value.join(', ') || 'Non définis' }}
              </span>
            </p>
          </div>
        </div>

        <div class="structure-section mb-4">
          <h4 class="font-medium">Structure</h4>
          <div class="pl-4">
            <p>
              Titres H1:
              <span :class="getStatusColor(analysisResults.details.structure.h1Count.status)">
                {{ analysisResults.details.structure.h1Count.value }}
              </span>
            </p>
            <p>
              Titres H2:
              <span :class="getStatusColor(analysisResults.details.structure.h2Count.status)">
                {{ analysisResults.details.structure.h2Count.value }}
              </span>
            </p>
          </div>
        </div>

        <div class="images-section">
          <h4 class="font-medium">Images</h4>
          <div class="pl-4">
            <p>Total: {{ analysisResults.details.images.total }}</p>
            <p>
              Images avec alt: {{ analysisResults.details.images.withAlt }}
              <span :class="getStatusColor(analysisResults.details.images.status)">
                ({{ analysisResults.details.images.withoutAlt }} sans alt)
              </span>
            </p>
          </div>
        </div>
      </div>

      <button
        @click="optimizePage"
        class="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        :disabled="isAnalyzing"
      >
        {{ isAnalyzing ? 'Optimisation en cours...' : 'Optimiser la page' }}
      </button>
    </div>
  </div>
</template> 