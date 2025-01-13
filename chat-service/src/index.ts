import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import amqp from 'amqplib';

/**
 * Interface pour les événements d'apprentissage
 */
interface EvenementApprentissage {
  type: 'message' | 'connexion' | 'deconnexion' | 'action';
  source: 'chat' | 'memory' | 'seo' | 'marketing' | 'backend';
  donnees: any;
  timestamp: number;
}

/**
 * Interface pour le système de recommandation
 */
interface SystemeRecommandation {
  type: 'contenu' | 'utilisateur' | 'collaboratif';
  score: number;
  confiance: number;
  source: string;
  recommendation: string;
}

/**
 * Interface pour l'analyse de sentiment
 */
interface AnalyseSentiment {
  texte: string;
  sentiment: 'positif' | 'negatif' | 'neutre';
  score: number;
  aspects: {
    sujet: string;
    sentiment: string;
    score: number;
  }[];
}

/**
 * Interface pour le profil d'apprentissage
 */
interface ProfilApprentissage {
  userId: string;
  niveau: 'debutant' | 'intermediaire' | 'avance';
  interets: string[];
  comportement: {
    tempsReponse: number;
    frequenceMessages: number;
    participationGroupes: string[];
  };
  preferences: {
    langue: string;
    notifications: boolean;
    themesCles: string[];
  };
  progression: {
    niveauActuel: number;
    objectifs: string[];
    competencesAcquises: string[];
  };
}

/**
 * Interface pour la synchronisation des services
 */
interface SynchronisationServices {
  service: string;
  action: 'mise_a_jour' | 'suppression' | 'creation';
  donnees: {
    type: string;
    contenu: any;
    metadata: {
      version: string;
      timestamp: number;
      auteur: string;
    };
  };
}

/**
 * Interface pour les métriques d'apprentissage
 */
interface MetriquesApprentissage {
  utilisateur: {
    engagement: number;
    progression: number;
    satisfaction: number;
  };
  systeme: {
    precision: number;
    rappel: number;
    tempsReponse: number;
  };
  modele: {
    performance: number;
    erreurs: number;
    ameliorations: string[];
  };
}

/**
 * Interface pour le contexte d'apprentissage
 */
interface ContexteApprentissage {
  session: {
    id: string;
    debut: number;
    derniereActivite: number;
  };
  environnement: {
    plateforme: string;
    version: string;
    configuration: any;
  };
  etatActuel: {
    phase: 'observation' | 'analyse' | 'adaptation' | 'amelioration';
    parametres: Map<string, any>;
    objectifs: string[];
  };
}

/**
 * Structure d'un message dans le système de chat
 * Permet de définir clairement les informations nécessaires pour chaque message
 */
interface MessageChat {
  room: string;          // La salle où le message est envoyé (ex: "general", "support")
  message: string;       // Le contenu du message
  userId: string;        // L'identifiant unique de l'utilisateur qui envoie le message
  timestamp?: number;    // Le moment où le message a été envoyé (en millisecondes)
}

/**
 * Extension de la connexion Socket.IO pour ajouter des informations utilisateur
 * Cela nous permet de suivre les activités de chaque utilisateur connecté
 */
interface UtilisateurConnecte {
  id: string;           // Identifiant unique de la connexion socket
  userId?: string;      // Identifiant de l'utilisateur (peut être défini après l'authentification)
  sallesActives: Set<string>;  // Liste des salles où l'utilisateur est actuellement
  
  // Méthodes héritées de Socket.IO
  join(room: string): void;
  leave(room: string): void;
  to(room: string): any;
  emit(event: string, ...args: any[]): void;
  on(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Structure pour stocker les interactions et leur contexte
 * Permet au système d'apprendre des conversations précédentes
 */
interface InteractionMemoire {
  userId: string;           // Identifiant de l'utilisateur
  message: string;          // Message envoyé
  contexte: {
    salle: string;         // Salle où le message a été envoyé
    timestamp: number;     // Moment de l'envoi
    messagesPrecedents: string[];  // Messages précédents dans la conversation
    reponses: string[];    // Réponses reçues
    sentiment: string;     // Analyse du sentiment (positif, négatif, neutre)
  };
  statistiques: {
    frequence: number;     // Fréquence d'utilisation de certains mots/phrases
    tempsReponse: number;  // Temps moyen de réponse
    interactions: number;  // Nombre d'interactions dans cette conversation
  };
}

/**
 * Structure pour l'analyse des tendances de conversation
 */
interface AnalyseConversation {
  motsCles: Map<string, number>;     // Mots-clés fréquents
  sujetsPopulaires: string[];        // Sujets les plus discutés
  heuresActives: Map<number, number>; // Heures d'activité maximale
}

/**
 * Interface pour les connexions aux services externes
 */
interface ServicesConnexions {
  seo: string;          // URL du service SEO
  memory: string;       // URL du service de mémoire
  marketing: string;    // URL du service marketing
  backend: string;      // URL du backend principal
}

/**
 * Structure pour les données d'apprentissage enrichies
 */
interface DonneesApprentissage {
  seo: {
    motsCles: string[];
    performance: number;
  };
  memory: {
    contexteUtilisateur: any;
    historique: string[];
  };
  marketing: {
    segmentUtilisateur: string;
    campagnes: string[];
  };
  backend: {
    preferences: any;
    activites: string[];
  };
}

// Configuration du serveur Express et Socket.IO
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static('public'));

// Initialisation de la connexion Redis pour stocker l'historique des messages
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

// Initialisation d'Elasticsearch pour la recherche de messages
const elasticClient = new ElasticClient({
  node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200'
});

// Connexion à Redis et gestion des erreurs
redisClient.connect().catch(err => {
  console.error('Erreur de connexion à Redis:', err);
});

// Middleware pour parser le JSON dans les requêtes
app.use(express.json());

/**
 * Point de terminaison pour vérifier l'état du service
 * Permet de monitorer la santé des connexions Redis et Elasticsearch
 */
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    redis: redisClient.isOpen ? 'connecté' : 'déconnecté',
    elasticsearch: await elasticClient.ping()
      .then(() => 'connecté')
      .catch(() => 'déconnecté')
  };
  res.json(health);
});

/**
 * Gestionnaire de mémoire pour l'apprentissage
 */
class MemoireApprentissage {
  protected readonly PREFIX_MEMOIRE = 'memoire:';
  protected readonly PREFIX_ANALYSE = 'analyse:';
  
  constructor(
    protected redisClient: ReturnType<typeof createClient>,
    protected elasticClient: ElasticClient
  ) {}

  /**
   * Enregistre une nouvelle interaction pour apprentissage
   */
  async sauvegarderInteraction(interaction: InteractionMemoire): Promise<void> {
    try {
      // Stockage dans Redis pour accès rapide
      await this.redisClient.hSet(
        `${this.PREFIX_MEMOIRE}${interaction.userId}`,
        interaction.contexte.timestamp.toString(),
        JSON.stringify(interaction)
      );

      // Indexation dans Elasticsearch pour analyse
      await this.elasticClient.index({
        index: 'interactions-apprentissage',
        document: interaction
      });

      console.log(`📚 Nouvelle interaction enregistrée pour l'apprentissage`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'interaction:', error);
    }
  }

  /**
   * Analyse les tendances des conversations
   */
  async analyserTendances(salle: string): Promise<AnalyseConversation> {
    try {
      const resultat = await this.elasticClient.search({
        index: 'interactions-apprentissage',
        body: {
          query: {
            match: { 'contexte.salle': salle }
          },
          aggs: {
            mots_frequents: {
              terms: { field: 'message.keyword' }
            },
            sujets: {
              terms: { field: 'contexte.messagesPrecedents.keyword' }
            }
          }
        }
      });

      // Traitement des résultats
      const analyse: AnalyseConversation = {
        motsCles: new Map(),
        sujetsPopulaires: [],
        heuresActives: new Map()
      };

      // ... traitement des agrégations

      return analyse;
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des tendances:', error);
      return {
        motsCles: new Map(),
        sujetsPopulaires: [],
        heuresActives: new Map()
      };
    }
  }
}

/**
 * Gestionnaire de mémoire avancé avec intégration multi-services
 */
class MemoireApprentissageAvancee extends MemoireApprentissage {
  private metriques!: MetriquesApprentissage;
  private contexte!: ContexteApprentissage;
  private profils!: Map<string, ProfilApprentissage>;
  private rabbitmqChannel: amqp.Channel | null = null;
  private readonly QUEUE_APPRENTISSAGE = 'apprentissage_chat';

  constructor(
    redisClient: ReturnType<typeof createClient>,
    elasticClient: ElasticClient,
    private services: ServicesConnexions
  ) {
    super(redisClient, elasticClient);
    this.initialiserApprentissage();
  }

  private async initialiserApprentissage(): Promise<void> {
    this.profils = new Map();
    this.metriques = {
      utilisateur: { engagement: 0, progression: 0, satisfaction: 0 },
      systeme: { precision: 0, rappel: 0, tempsReponse: 0 },
      modele: { performance: 0, erreurs: 0, ameliorations: [] }
    };
    this.contexte = {
      session: {
        id: crypto.randomUUID(),
        debut: Date.now(),
        derniereActivite: Date.now()
      },
      environnement: {
        plateforme: 'chat-service',
        version: '1.0.0',
        configuration: {}
      },
      etatActuel: {
        phase: 'observation',
        parametres: new Map(),
        objectifs: ['amelioration_continue', 'personnalisation']
      }
    };
    await this.initialiserRabbitMQ();
  }

  public async traiterEvenement(evenement: EvenementApprentissage): Promise<void> {
    try {
      // Mise à jour du contexte
      this.contexte.session.derniereActivite = Date.now();
      
      // Analyse du sentiment si c'est un message
      if (evenement.type === 'message') {
        const sentiment = await this.analyserSentiment(evenement.donnees.message);
        await this.mettreAJourProfil(evenement.donnees.userId, sentiment);
      }

      // Synchronisation avec les autres services
      const sync: SynchronisationServices = {
        service: 'chat',
        action: 'mise_a_jour',
        donnees: {
          type: evenement.type,
          contenu: evenement.donnees,
          metadata: {
            version: '1.0',
            timestamp: Date.now(),
            auteur: 'chat-service'
          }
        }
      };

      await this.synchroniserServices(sync);
    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'événement:', error);
    }
  }

  /**
   * Initialise la connexion RabbitMQ pour la communication inter-services
   */
  private async initialiserRabbitMQ(): Promise<void> {
    try {
      const connexion = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
      this.rabbitmqChannel = await connexion.createChannel();
      await this.rabbitmqChannel.assertQueue(this.QUEUE_APPRENTISSAGE);
      console.log('📡 Connexion RabbitMQ établie pour l\'apprentissage');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de RabbitMQ:', error);
    }
  }

  /**
   * Enrichit l'interaction avec les données des autres services
   */
  async enrichirInteraction(interaction: InteractionMemoire): Promise<InteractionMemoire & DonneesApprentissage> {
    const donneesEnrichies = {
      ...interaction,
      seo: { motsCles: [], performance: 0 },
      memory: { contexteUtilisateur: {}, historique: [] },
      marketing: { segmentUtilisateur: '', campagnes: [] },
      backend: { preferences: {}, activites: [] }
    };

    try {
      // Récupération des données SEO
      const reponsesSEO = await fetch(`${this.services.seo}/analyse`, {
        method: 'POST',
        body: JSON.stringify({ texte: interaction.message })
      }).then(r => r.json());
      donneesEnrichies.seo = reponsesSEO;

      // Récupération du contexte mémoire
      const contexteMémoire = await fetch(`${this.services.memory}/contexte/${interaction.userId}`)
        .then(r => r.json());
      donneesEnrichies.memory = contexteMémoire;

      // Données marketing
      const profilMarketing = await fetch(`${this.services.marketing}/profil/${interaction.userId}`)
        .then(r => r.json());
      donneesEnrichies.marketing = profilMarketing;

      // Informations du backend
      const donneesBackend = await fetch(`${this.services.backend}/utilisateur/${interaction.userId}`)
        .then(r => r.json());
      donneesEnrichies.backend = donneesBackend;

      // Publication pour apprentissage distribué
      if (this.rabbitmqChannel) {
        await this.rabbitmqChannel.sendToQueue(
          this.QUEUE_APPRENTISSAGE,
          Buffer.from(JSON.stringify(donneesEnrichies))
        );
      }

      return donneesEnrichies;
    } catch (error) {
      console.error('❌ Erreur lors de l\'enrichissement des données:', error);
      return donneesEnrichies;
    }
  }

  /**
   * Analyse avancée avec données multi-services
   */
  async analyseGlobale(userId: string): Promise<any> {
    try {
      const [elasticData, redisData] = await Promise.all([
        this.elasticClient.search({
          index: 'interactions-apprentissage',
          body: {
            query: { match: { userId } }
          }
        }),
        this.redisClient.hGetAll(`${this.PREFIX_MEMOIRE}${userId}`)
      ]);

      // Analyse des données combinées
      const analyse = {
        tendances: this.analyserTendances(elasticData),
        preferences: this.extrairePreferences(redisData),
        recommendations: await this.genererRecommendations(userId)
      };

      return analyse;
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse globale:', error);
      return null;
    }
  }

  /**
   * Génère des recommendations basées sur l'apprentissage
   */
  public async genererRecommendations(userId: string): Promise<string[]> {
    try {
      const [marketing, memory, seo] = await Promise.all([
        fetch(`${this.services.marketing}/recommendations/${userId}`).then(r => r.json()),
        fetch(`${this.services.memory}/suggestions/${userId}`).then(r => r.json()),
        fetch(`${this.services.seo}/optimisations/${userId}`).then(r => r.json())
      ]);

      return [...marketing, ...memory, ...seo];
    } catch (error) {
      console.error('❌ Erreur lors de la génération des recommendations:', error);
      return [];
    }
  }

  public async getProfil(userId: string): Promise<ProfilApprentissage | null> {
    return this.profils.get(userId) || null;
  }

  public async getMetriques(): Promise<MetriquesApprentissage> {
    return this.metriques;
  }

  private async analyserSentiment(texte: string): Promise<AnalyseSentiment> {
    return {
      texte,
      sentiment: 'neutre',
      score: 0.5,
      aspects: []
    };
  }

  private async mettreAJourProfil(userId: string, sentiment: AnalyseSentiment): Promise<void> {
    const profil = this.profils.get(userId) || {
      userId,
      niveau: 'debutant',
      interets: [],
      comportement: {
        tempsReponse: 0,
        frequenceMessages: 0,
        participationGroupes: []
      },
      preferences: {
        langue: 'fr',
        notifications: true,
        themesCles: []
      },
      progression: {
        niveauActuel: 1,
        objectifs: [],
        competencesAcquises: []
      }
    };

    // Mise à jour du profil basée sur le sentiment
    this.profils.set(userId, profil);
  }

  private async synchroniserServices(sync: SynchronisationServices): Promise<void> {
    if (this.rabbitmqChannel) {
      await this.rabbitmqChannel.sendToQueue(
        this.QUEUE_APPRENTISSAGE,
        Buffer.from(JSON.stringify(sync))
      );
    }
  }

  private async extrairePreferences(donnees: Record<string, string>): Promise<any> {
    return Object.entries(donnees).reduce((acc, [key, value]) => {
      try {
        acc[key] = JSON.parse(value);
      } catch {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  public async analyserTendances(donnees: any): Promise<AnalyseConversation> {
    const analyse = await super.analyserTendances(donnees.salle || '');
    return {
      ...analyse,
      motsCles: new Map(Object.entries(donnees?.aggregations?.mots_frequents?.buckets || {})),
      sujetsPopulaires: donnees?.aggregations?.sujets?.buckets?.map((b: any) => b.key) || [],
      heuresActives: new Map()
    };
  }
}

// Configuration des connexions aux services
const servicesConfig: ServicesConnexions = {
  seo: process.env.SEO_SERVICE_URL || 'http://seo-service:3020',
  memory: process.env.MEMORY_SERVICE_URL || 'http://memory-service:3030',
  marketing: process.env.MARKETING_SERVICE_URL || 'http://marketing-service:3040',
  backend: process.env.BACKEND_URL || 'http://backend:3010'
};

// Création de l'instance de mémoire d'apprentissage avancée
const memoireApprentissage = new MemoireApprentissageAvancee(
  redisClient,
  elasticClient,
  servicesConfig
);

/**
 * Gestion des connexions WebSocket
 * Chaque nouvelle connexion crée une instance de UtilisateurConnecte
 */
io.on('connection', (socket: any) => {
  const utilisateur = socket as UtilisateurConnecte;
  utilisateur.sallesActives = new Set();
  
  console.log('➕ Nouveau client connecté:', utilisateur.id);

  // Gestion de l'entrée dans une salle
  utilisateur.on('join-room', (room: string) => {
    utilisateur.join(room);
    utilisateur.sallesActives.add(room);
    console.log(`👥 ${utilisateur.id} a rejoint la salle: ${room}`);
  });

  // Gestion de la sortie d'une salle
  utilisateur.on('leave-room', (room: string) => {
    utilisateur.leave(room);
    utilisateur.sallesActives.delete(room);
    console.log(`👋 ${utilisateur.id} a quitté la salle: ${room}`);
  });

  // Gestion des messages avec apprentissage
  utilisateur.on('message', async (data: MessageChat) => {
    const messageComplet: MessageChat = {
      ...data,
      timestamp: Date.now()
    };
    
    try {
      // Sauvegarde et diffusion normales
      await redisClient.lPush(`chat:${data.room}`, JSON.stringify(messageComplet));
      utilisateur.to(data.room).emit('message', messageComplet);

      // Récupération du contexte pour l'apprentissage
      const messagesPrecedents = await redisClient.lRange(`chat:${data.room}`, 0, 4);
      
      // Création de l'interaction pour apprentissage
      const interaction: InteractionMemoire = {
        userId: data.userId,
        message: data.message,
        contexte: {
          salle: data.room,
          timestamp: messageComplet.timestamp || Date.now(),
          messagesPrecedents: messagesPrecedents.map(m => JSON.parse(m).message),
          reponses: [],
          sentiment: 'neutre' // À implémenter avec une analyse de sentiment
        },
        statistiques: {
          frequence: 1,
          tempsReponse: 0,
          interactions: messagesPrecedents.length + 1
        }
      };

      // Sauvegarde pour apprentissage
      await memoireApprentissage.sauvegarderInteraction(interaction);

      // Analyse périodique des tendances
      if (Math.random() < 0.1) { // 10% de chance d'analyser
        const analyse = await memoireApprentissage.analyserTendances(data.room);
        console.log(`📊 Analyse des tendances pour ${data.room}:`, analyse);
      }

      // Enrichissement et analyse avancée
      const interactionEnrichie = await memoireApprentissage.enrichirInteraction(interaction);
      
      // Analyse globale périodique
      if (Math.random() < 0.05) { // 5% de chance
        const analyseGlobale = await memoireApprentissage.analyseGlobale(data.userId);
        console.log(`🧠 Analyse globale pour ${data.userId}:`, analyseGlobale);
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      utilisateur.emit('error', 'Erreur lors du traitement');
    }
  });

  // Gestion de la déconnexion
  utilisateur.on('disconnect', () => {
    console.log(`➖ Client déconnecté: ${utilisateur.id}`);
    utilisateur.sallesActives.clear();
  });
});

// Ajout des endpoints pour l'interface d'apprentissage
app.get('/apprentissage/profil/:userId', async (req, res) => {
  try {
    const profil = await memoireApprentissage.getProfil(req.params.userId);
    res.json(profil);
  } catch (error) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération du profil' });
  }
});

app.get('/apprentissage/metriques', async (req, res) => {
  try {
    const metriques = await memoireApprentissage.getMetriques();
    res.json(metriques);
  } catch (error) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération des métriques' });
  }
});

app.get('/apprentissage/analyse/:salle', async (req, res) => {
  try {
    const analyse = await memoireApprentissage.analyserTendances(req.params.salle);
    res.json(analyse);
  } catch (error) {
    res.status(500).json({ erreur: 'Erreur lors de l\'analyse' });
  }
});

app.get('/apprentissage/recommendations/:userId', async (req, res) => {
  try {
    const recommendations = await memoireApprentissage.genererRecommendations(req.params.userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ erreur: 'Erreur lors de la génération des recommendations' });
  }
});

// Démarrage du serveur
httpServer.listen(port, () => {
  console.log(`🚀 Service de chat démarré sur http://localhost:${port}`);
}); 