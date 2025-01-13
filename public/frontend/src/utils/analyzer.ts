import { SeoService } from '../services/seo';
import { withErrorHandling, ErrorTypes, createError } from './errorHandler';

interface ApiError extends Error {
  response?: { status: number };
}

// Types d'analyse
export const AnalysisTypes = {
  BASIC: 'basic',
  DETAILED: 'detailed',
  TECHNICAL: 'technical'
} as const;

export type AnalysisType = typeof AnalysisTypes[keyof typeof AnalysisTypes];

interface AnalysisConfig {
  type: AnalysisType;
  timeout: number;
  maxRetries: number;
}

interface AnalysisResult {
  url: string;
  results: {
    [key: string]: {
      score?: number;
      message?: string;
      recommendations?: string[];
    };
  };
}

interface FormattedAnalysis {
  url: string;
  score: number;
  summary: {
    issues: string[];
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
  };
  details: AnalysisResult['results'];
  timestamp: string;
}

// Configuration par défaut
const defaultConfig: AnalysisConfig = {
  type: AnalysisTypes.BASIC,
  timeout: 30000,
  maxRetries: 3
};

// Fonction principale d'analyse
export const analyzeUrl = withErrorHandling(async (url: string, config: Partial<AnalysisConfig> = {}): Promise<FormattedAnalysis> => {
  // Validation de l'URL
  if (!isValidUrl(url)) {
    throw createError(
      'URL invalide',
      ErrorTypes.VALIDATION,
      { url }
    );
  }

  const finalConfig = { ...defaultConfig, ...config };
  
  try {
    const analysis = await SeoService.analyze(url, finalConfig);
    return formatAnalysisResults(analysis);
  } catch (error) {
    if ((error as ApiError).response?.status === 429) {
      throw createError(
        'Trop de requêtes, veuillez réessayer plus tard',
        ErrorTypes.API,
        { url, config: finalConfig }
      );
    }
    throw error;
  }
}, { component: 'Analyzer' });

// Formater les résultats
const formatAnalysisResults = (analysis: AnalysisResult): FormattedAnalysis => {
  return {
    url: analysis.url,
    score: calculateScore(analysis.results),
    summary: generateSummary(analysis.results),
    details: analysis.results,
    timestamp: new Date().toISOString()
  };
};

// Calculer le score SEO
const calculateScore = (results: AnalysisResult['results']): number => {
  const weights: { [key: string]: number } = {
    title: 0.2,
    description: 0.15,
    keywords: 0.1,
    headings: 0.15,
    content: 0.2,
    performance: 0.2
  };

  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(results).forEach(([key, value]) => {
    if (weights[key]) {
      totalScore += (value.score ?? 0) * weights[key];
      totalWeight += weights[key];
    }
  });

  return Math.round((totalScore / totalWeight) * 100);
};

const getPriority = (issuesCount: number): 'high' | 'medium' | 'low' => {
  if (issuesCount > 5) return 'high';
  if (issuesCount > 2) return 'medium';
  return 'low';
};

const generateSummary = (results: AnalysisResult['results']): FormattedAnalysis['summary'] => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  Object.entries(results).forEach(([_, value]) => {
    if (value.score && value.score < 0.7 && value.message) {
      issues.push(value.message);
    }
    if (value.recommendations?.length) {
      recommendations.push(...value.recommendations);
    }
  });

  return {
    issues,
    recommendations,
    priority: getPriority(issues.length)
  };
};

// Valider l'URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}; 