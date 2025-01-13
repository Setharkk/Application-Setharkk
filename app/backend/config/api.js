const apiConfig = {
  prefix: '/api',
  version: 'v1',
  routes: {
    chat: '/chat',
    seo: '/seo',
    editor: '/editor',
    analysis: '/analysis',
    error: '/errors',
    auth: '/auth',
    marketing: '/marketing',
    prospection: '/prospection'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limite par IP
    message: {
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    }
  },
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'default_secret',
      expiresIn: '24h'
    },
    bcrypt: {
      saltRounds: 10
    }
  },
  validation: {
    password: {
      minLength: 8,
      requireSpecialChar: true,
      requireNumber: true
    }
  }
};

// Validation de la configuration
const validateConfig = () => {
  if (apiConfig.security.jwt.secret === 'default_secret') {
    console.warn('ATTENTION: Utilisation de la clé JWT par défaut. Définissez JWT_SECRET dans les variables d\'environnement.');
  }
  
  if (!process.env.FRONTEND_URL) {
    console.warn('ATTENTION: FRONTEND_URL non défini. Utilisation de l\'URL par défaut.');
  }
};

validateConfig();

module.exports = apiConfig;
