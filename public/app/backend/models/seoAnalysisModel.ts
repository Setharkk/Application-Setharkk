import mongoose, { Document, Schema } from 'mongoose';

interface IMetaTags {
  description?: string;
  keywords?: string[];
  robots?: string;
}

interface IHeadings {
  h1Count: number;
  h2Count: number;
  structure: string;
}

interface IImages {
  total: number;
  withAlt: number;
  withoutAlt: number;
}

interface ISEOAnalysis extends Document {
  url: string;
  title: string;
  metaTags: IMetaTags;
  headings: IHeadings;
  images: IImages;
  recommendations: string[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
  calculateScore: () => number;
  generateRecommendations: () => string[];
}

const seoAnalysisSchema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  metaTags: {
    description: String,
    keywords: [String],
    robots: String
  },
  headings: {
    h1Count: Number,
    h2Count: Number,
    structure: String
  },
  images: {
    total: Number,
    withAlt: Number,
    withoutAlt: Number
  },
  recommendations: [String],
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour la date de modification
seoAnalysisSchema.pre('save', function(this: ISEOAnalysis, next: () => void): void {
  this.updatedAt = new Date();
  next();
});

// Méthode pour calculer le score SEO
seoAnalysisSchema.methods.calculateScore = function(this: ISEOAnalysis): number {
  let score = 100;
  
  // Vérification du titre
  if (!this.title) score -= 20;
  else if (this.title.length < 30 || this.title.length > 60) score -= 10;
  
  // Vérification de la meta description
  if (!this.metaTags.description) score -= 15;
  else if (this.metaTags.description.length < 120 || this.metaTags.description.length > 160) score -= 7;
  
  // Vérification des mots-clés
  if (!this.metaTags.keywords || this.metaTags.keywords.length === 0) score -= 10;
  
  // Vérification de la structure des titres
  if (this.headings.h1Count !== 1) score -= 15;
  if (this.headings.h2Count === 0) score -= 5;
  
  // Vérification des images
  if (this.images.withoutAlt > 0) {
    const penaltyPerImage = 5;
    score -= Math.min(20, this.images.withoutAlt * penaltyPerImage);
  }
  
  this.score = Math.max(0, score);
  return this.score;
};

// Méthode pour générer des recommandations
seoAnalysisSchema.methods.generateRecommendations = function(this: ISEOAnalysis): string[] {
  const recommendations: string[] = [];
  
  if (!this.title) {
    recommendations.push("Ajoutez un titre à votre page");
  } else if (this.title.length < 30 || this.title.length > 60) {
    recommendations.push("Optimisez la longueur du titre (30-60 caractères)");
  }
  
  if (!this.metaTags.description) {
    recommendations.push("Ajoutez une meta description");
  } else if (this.metaTags.description.length < 120 || this.metaTags.description.length > 160) {
    recommendations.push("Optimisez la longueur de la meta description (120-160 caractères)");
  }
  
  if (!this.metaTags.keywords || this.metaTags.keywords.length === 0) {
    recommendations.push("Ajoutez des mots-clés pertinents");
  }
  
  if (this.headings.h1Count !== 1) {
    recommendations.push("Assurez-vous d'avoir exactement un titre H1");
  }
  
  if (this.headings.h2Count === 0) {
    recommendations.push("Ajoutez des sous-titres H2 pour structurer votre contenu");
  }
  
  if (this.images.withoutAlt > 0) {
    recommendations.push(`Ajoutez des attributs alt aux ${this.images.withoutAlt} images qui n'en ont pas`);
  }
  
  this.recommendations = recommendations;
  return recommendations;
};

export const SEOAnalysis = mongoose.model<ISEOAnalysis>('SEOAnalysis', seoAnalysisSchema); 