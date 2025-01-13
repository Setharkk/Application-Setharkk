export const SeoService = {
  analyze: async (url: string, config: any) => {
    console.log('Analyse SEO avec config:', config);
    // Simulation d'analyse SEO
    return {
      url,
      results: {
        title: { score: 0.8, message: "Titre optimisé" },
        description: { score: 0.7, message: "Description présente" },
        keywords: { score: 0.6, message: "Mots-clés identifiés" },
        headings: { score: 0.9, message: "Structure des titres correcte" },
        content: { score: 0.75, message: "Contenu bien structuré" },
        performance: { score: 0.85, message: "Bonnes performances" }
      }
    };
  }
}; 