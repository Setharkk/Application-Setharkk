import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

interface TitleAnalysis {
  content: string;
  length: number;
  score: number;
}

interface MetaTagAnalysis {
  content: string;
  length: number;
  score: number;
}

interface KeywordsAnalysis {
  content: string;
  count: number;
}

interface MetaAnalysis {
  description: MetaTagAnalysis;
  keywords: KeywordsAnalysis;
}

interface HeadingGroup {
  count: number;
  content: string[];
  score?: number;
}

interface HeadingsAnalysis {
  h1: HeadingGroup;
  h2: HeadingGroup;
  h3: HeadingGroup;
}

interface ImageDetails {
  src: string | null;
  alt: string | null;
  hasAlt: boolean;
}

interface ImagesAnalysis {
  count: number;
  withoutAlt: number;
  details: ImageDetails[];
}

interface LinkDetails {
  href: string | null;
  text: string;
  isExternal: boolean;
}

interface LinksAnalysis {
  count: number;
  internal: number;
  external: number;
  details: LinkDetails[];
}

interface PerformanceAnalysis {
  loadTime?: number;
  status?: number;
  contentType?: string | null;
  size?: number;
  error?: string;
}

interface PageAnalysis {
  title: TitleAnalysis;
  meta: MetaAnalysis;
  headings: HeadingsAnalysis;
  images: ImagesAnalysis;
  links: LinksAnalysis;
  performance: PerformanceAnalysis;
  timestamp: number;
}

export class SeoAnalyzer {
  async analyzePage(url: string): Promise<PageAnalysis> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      return {
        title: this.analyzeTitle(document),
        meta: this.analyzeMeta(document),
        headings: this.analyzeHeadings(document),
        images: this.analyzeImages(document),
        links: this.analyzeLinks(document),
        performance: await this.analyzePerformance(url),
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'analyse de ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private analyzeTitle(document: Document): TitleAnalysis {
    const title = document.querySelector('title');
    return {
      content: title ? title.textContent || '' : '',
      length: title ? (title.textContent || '').length : 0,
      score: this.scoreTitleTag(title)
    };
  }

  private analyzeMeta(document: Document): MetaAnalysis {
    const description = document.querySelector('meta[name="description"]');
    const keywords = document.querySelector('meta[name="keywords"]');
    
    return {
      description: {
        content: description ? description.getAttribute('content') || '' : '',
        length: description ? (description.getAttribute('content') || '').length : 0,
        score: this.scoreMetaDescription(description)
      },
      keywords: {
        content: keywords ? keywords.getAttribute('content') || '' : '',
        count: keywords ? (keywords.getAttribute('content') || '').split(',').length : 0
      }
    };
  }

  private analyzeHeadings(document: Document): HeadingsAnalysis {
    const headings = {
      h1: Array.from(document.querySelectorAll('h1')),
      h2: Array.from(document.querySelectorAll('h2')),
      h3: Array.from(document.querySelectorAll('h3'))
    };

    return {
      h1: {
        count: headings.h1.length,
        content: headings.h1.map(h => h.textContent || ''),
        score: this.scoreHeadings(headings)
      },
      h2: {
        count: headings.h2.length,
        content: headings.h2.map(h => h.textContent || '')
      },
      h3: {
        count: headings.h3.length,
        content: headings.h3.map(h => h.textContent || '')
      }
    };
  }

  private analyzeImages(document: Document): ImagesAnalysis {
    const images = Array.from(document.querySelectorAll('img'));
    return {
      count: images.length,
      withoutAlt: images.filter(img => !img.hasAttribute('alt')).length,
      details: images.map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        hasAlt: img.hasAttribute('alt')
      }))
    };
  }

  private analyzeLinks(document: Document): LinksAnalysis {
    const links = Array.from(document.querySelectorAll('a'));
    return {
      count: links.length,
      internal: links.filter(link => {
        const href = link.getAttribute('href');
        return href && !href.startsWith('http');
      }).length,
      external: links.filter(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('http');
      }).length,
      details: links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent || '',
        isExternal: link.getAttribute('href')?.startsWith('http') || false
      }))
    };
  }

  private async analyzePerformance(url: string): Promise<PerformanceAnalysis> {
    try {
      const startTime = Date.now();
      const response = await fetch(url);
      const endTime = Date.now();
      
      return {
        loadTime: endTime - startTime,
        status: response.status,
        contentType: response.headers.get('content-type'),
        size: parseInt(response.headers.get('content-length') || '0', 10)
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Fonctions de scoring
  private scoreTitleTag(title: Element | null): number {
    if (!title) return 0;
    const length = (title.textContent || '').length;
    if (length < 10) return 2;
    if (length < 30) return 5;
    if (length < 60) return 10;
    if (length < 70) return 8;
    return 5;
  }

  private scoreMetaDescription(description: Element | null): number {
    if (!description) return 0;
    const length = (description.getAttribute('content') || '').length;
    if (length < 50) return 2;
    if (length < 120) return 5;
    if (length < 160) return 10;
    if (length < 180) return 8;
    return 5;
  }

  private scoreHeadings(headings: { h1: Element[]; h2: Element[]; h3: Element[] }): number {
    let score = 0;
    if (headings.h1.length === 1) score += 5;
    if (headings.h2.length > 0) score += 3;
    if (headings.h3.length > 0) score += 2;
    return score;
  }
}

export default new SeoAnalyzer(); 