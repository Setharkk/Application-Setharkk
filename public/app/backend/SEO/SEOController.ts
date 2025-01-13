import { openai } from '../../config/openai';

interface SEOMetric {
  label: string;
  score: number;
  content?: string;
  description: string;
  recommendations: string[];
}

interface SEOMetrics {
  title: SEOMetric;
  meta: SEOMetric;
  headings: SEOMetric;
  images: SEOMetric;
  links: SEOMetric;
  content: SEOMetric;
}

interface SEOAnalysisResult {
  url: string;
  score: number;
  metrics: SEOMetrics;
  suggestions: string[];
}

export class SEOController {
  async analyzeUrl(url: string): Promise<SEOAnalysisResult> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      return await this.analyzePage(html, url);
    } catch (error) {
      throw new Error(`Erreur lors de l'analyse de l'URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async analyzePage(html: string, url: string): Promise<SEOAnalysisResult> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const metrics: SEOMetrics = {
      title: this.analyzeTitle(doc),
      meta: this.analyzeMeta(doc),
      headings: this.analyzeHeadings(doc),
      images: this.analyzeImages(doc),
      links: this.analyzeLinks(doc),
      content: this.analyzeContent(doc)
    };

    const aiSuggestions = await this.getAISuggestions(metrics, url);
    
    // Calcul du score global
    const scores = Object.values(metrics).map(m => m.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      url,
      score: Math.round(averageScore),
      metrics,
      suggestions: aiSuggestions
    };
  }

  private analyzeTitle(doc: Document): SEOMetric {
    const title = doc.querySelector('title')?.textContent || '';
    const score = this.calculateTitleScore(title);
    
    return {
      label: 'Titre de la page',
      score,
      content: title,
      description: this.getTitleFeedback(title),
      recommendations: this.getTitleRecommendations(title)
    };
  }

  private analyzeMeta(doc: Document): SEOMetric {
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const score = this.calculateMetaScore(description, keywords);
    
    return {
      label: 'Méta-données',
      score,
      description: this.getMetaFeedback(description, keywords),
      recommendations: this.getMetaRecommendations(description, keywords)
    };
  }

  private analyzeHeadings(doc: Document): SEOMetric {
    const h1s = Array.from(doc.querySelectorAll('h1'));
    const h2s = Array.from(doc.querySelectorAll('h2'));
    const h3s = Array.from(doc.querySelectorAll('h3'));
    const score = this.calculateHeadingsScore(h1s, h2s, h3s);
    
    return {
      label: 'Structure des titres',
      score,
      description: this.getHeadingsFeedback(h1s, h2s, h3s),
      recommendations: this.getHeadingsRecommendations(h1s, h2s, h3s)
    };
  }

  private analyzeImages(doc: Document): SEOMetric {
    const images = Array.from(doc.querySelectorAll('img'));
    const score = this.calculateImagesScore(images);
    
    return {
      label: 'Images',
      score,
      description: this.getImagesFeedback(images),
      recommendations: this.getImagesRecommendations(images)
    };
  }

  private analyzeLinks(doc: Document): SEOMetric {
    const links = Array.from(doc.querySelectorAll('a'));
    const score = this.calculateLinksScore(links);
    
    return {
      label: 'Liens',
      score,
      description: this.getLinksFeedback(links),
      recommendations: this.getLinksRecommendations(links)
    };
  }

  private analyzeContent(doc: Document): SEOMetric {
    const content = doc.body?.textContent || '';
    const score = this.calculateContentScore(content);
    
    return {
      label: 'Contenu',
      score,
      description: this.getContentFeedback(content),
      recommendations: this.getContentRecommendations(content)
    };
  }

  private async getAISuggestions(metrics: SEOMetrics, url: string): Promise<string[]> {
    try {
      const prompt = `Analyze the following SEO metrics for ${url} and provide specific recommendations for improvement:
      ${JSON.stringify(metrics, null, 2)}`;

      const response = await openai.createCompletion({
        model: 'gpt-4',
        prompt,
        max_tokens: 500,
        temperature: 0.7
      });

      return response.data.choices[0].text.trim().split('\n');
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return ['Impossible d\'obtenir des suggestions IA pour le moment.'];
    }
  }

  // Méthodes utilitaires pour le calcul des scores et la génération de feedback
  private calculateTitleScore(title: string): number {
    let score = 100;
    if (!title) score -= 50;
    if (title.length < 30 || title.length > 60) score -= 25;
    if (!/[a-zA-Z0-9]/.test(title)) score -= 25;
    return Math.max(0, score);
  }

  private calculateMetaScore(description: string, keywords: string): number {
    let score = 100;
    if (!description) score -= 40;
    if (description.length < 120 || description.length > 160) score -= 20;
    if (!keywords) score -= 20;
    return Math.max(0, score);
  }

  private calculateHeadingsScore(h1s: Element[], h2s: Element[], h3s: Element[]): number {
    let score = 100;
    if (h1s.length !== 1) score -= 30;
    if (h2s.length === 0) score -= 20;
    if (h3s.length === 0) score -= 10;
    return Math.max(0, score);
  }

  private calculateImagesScore(images: Element[]): number {
    let score = 100;
    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!(img as HTMLImageElement).alt) imagesWithoutAlt++;
    });
    score -= (imagesWithoutAlt / images.length) * 50;
    return Math.max(0, score);
  }

  private calculateLinksScore(links: Element[]): number {
    let score = 100;
    let linksWithoutText = 0;
    links.forEach(link => {
      if (!(link as HTMLAnchorElement).textContent?.trim()) linksWithoutText++;
    });
    score -= (linksWithoutText / links.length) * 50;
    return Math.max(0, score);
  }

  private calculateContentScore(content: string): number {
    let score = 100;
    const words = content.trim().split(/\s+/).length;
    if (words < 300) score -= 30;
    if (words < 600) score -= 20;
    return Math.max(0, score);
  }

  private getTitleFeedback(title: string): string {
    if (!title) return 'Aucun titre trouvé';
    if (title.length < 30) return 'Titre trop court';
    if (title.length > 60) return 'Titre trop long';
    return 'Titre bien optimisé';
  }

  private getTitleRecommendations(title: string): string[] {
    const recs: string[] = [];
    if (!title) recs.push('Ajouter un titre à la page');
    if (title.length < 30) recs.push('Allonger le titre (30-60 caractères recommandés)');
    if (title.length > 60) recs.push('Raccourcir le titre (30-60 caractères recommandés)');
    return recs;
  }

  private getMetaFeedback(description: string, keywords: string): string {
    if (!description) return 'Description meta manquante';
    if (description.length < 120) return 'Description meta trop courte';
    if (description.length > 160) return 'Description meta trop longue';
    return 'Description meta bien optimisée';
  }

  private getMetaRecommendations(description: string, keywords: string): string[] {
    const recs: string[] = [];
    if (!description) recs.push('Ajouter une meta description');
    if (description.length < 120) recs.push('Allonger la meta description (120-160 caractères recommandés)');
    if (description.length > 160) recs.push('Raccourcir la meta description (120-160 caractères recommandés)');
    if (!keywords) recs.push('Ajouter des meta keywords');
    return recs;
  }

  private getHeadingsFeedback(h1s: Element[], h2s: Element[], h3s: Element[]): string {
    if (h1s.length === 0) return 'Titre H1 manquant';
    if (h1s.length > 1) return 'Plusieurs titres H1 trouvés';
    if (h2s.length === 0) return 'Titres H2 manquants';
    return 'Structure des titres bien optimisée';
  }

  private getHeadingsRecommendations(h1s: Element[], h2s: Element[], h3s: Element[]): string[] {
    const recs: string[] = [];
    if (h1s.length === 0) recs.push('Ajouter un titre H1');
    if (h1s.length > 1) recs.push('Garder un seul titre H1');
    if (h2s.length === 0) recs.push('Ajouter des titres H2 pour structurer le contenu');
    if (h3s.length === 0) recs.push('Considérer l\'ajout de titres H3 pour plus de détails');
    return recs;
  }

  private getImagesFeedback(images: Element[]): string {
    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!(img as HTMLImageElement).alt) imagesWithoutAlt++;
    });
    if (imagesWithoutAlt === 0) return 'Toutes les images sont bien optimisées';
    return `${imagesWithoutAlt} image(s) sans attribut alt`;
  }

  private getImagesRecommendations(images: Element[]): string[] {
    const recs: string[] = [];
    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!(img as HTMLImageElement).alt) imagesWithoutAlt++;
    });
    if (imagesWithoutAlt > 0) {
      recs.push(`Ajouter des attributs alt descriptifs aux ${imagesWithoutAlt} image(s) manquante(s)`);
    }
    return recs;
  }

  private getLinksFeedback(links: Element[]): string {
    let linksWithoutText = 0;
    links.forEach(link => {
      if (!(link as HTMLAnchorElement).textContent?.trim()) linksWithoutText++;
    });
    if (linksWithoutText === 0) return 'Tous les liens sont bien optimisés';
    return `${linksWithoutText} lien(s) sans texte`;
  }

  private getLinksRecommendations(links: Element[]): string[] {
    const recs: string[] = [];
    let linksWithoutText = 0;
    links.forEach(link => {
      if (!(link as HTMLAnchorElement).textContent?.trim()) linksWithoutText++;
    });
    if (linksWithoutText > 0) {
      recs.push(`Ajouter du texte descriptif aux ${linksWithoutText} lien(s) vide(s)`);
    }
    return recs;
  }

  private getContentFeedback(content: string): string {
    const words = content.trim().split(/\s+/).length;
    if (words < 300) return 'Contenu trop court';
    if (words < 600) return 'Contenu un peu court';
    return 'Longueur de contenu satisfaisante';
  }

  private getContentRecommendations(content: string): string[] {
    const recs: string[] = [];
    const words = content.trim().split(/\s+/).length;
    if (words < 300) {
      recs.push('Ajouter plus de contenu (minimum 300 mots recommandés)');
    } else if (words < 600) {
      recs.push('Enrichir le contenu (600+ mots recommandés pour un meilleur référencement)');
    }
    return recs;
  }
} 