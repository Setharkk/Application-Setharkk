import mongoose, { Document, Schema } from 'mongoose';

export type ScenarioType = 'vente' | 'marketing' | 'prospection';
export type AppStatus = 'actif' | 'inactif' | 'erreur';

export interface Trigger {
    app: string;
    evenement: string;
    conditions: string[];
}

export interface Action {
    app: string;
    action: string;
    parametres: Record<string, any>;
}

export interface Configuration {
    declencheurs: Trigger[];
    actions: Action[];
}

export interface IntegratedApp {
    nom: string;
    api_key: string;
    webhook_url: string;
    statut: AppStatus;
}

export interface Statistics {
    executions_reussies: number;
    executions_echouees: number;
    dernier_execution?: Date;
    temps_moyen_execution?: number;
}

export interface Execution {
    reussi: boolean;
    duree: number;
}

export interface IMakeScenario extends Document {
    nom: string;
    description?: string;
    type: ScenarioType;
    scenario_id: string;
    configuration: Configuration;
    apps_integrees: IntegratedApp[];
    statistiques: Statistics;
    creerScenario(): Promise<any>;
    genererDeclencheurs(): Trigger[];
    genererActions(): Action[];
    mettreAJourStats(execution: Execution): Promise<void>;
    calculerTempsMoyenExecution(duree: number): number;
}

interface IMakeScenarioModel extends mongoose.Model<IMakeScenario> {
    creerScenarioDepuisTexte(texte: string): Promise<IMakeScenario>;
}

const makeScenarioSchema = new Schema<IMakeScenario>({
    nom: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['vente', 'marketing', 'prospection'],
        required: true
    },
    scenario_id: {
        type: String,
        required: true
    },
    configuration: {
        declencheurs: [{
            app: String,
            evenement: String,
            conditions: [String]
        }],
        actions: [{
            app: String,
            action: String,
            parametres: Schema.Types.Mixed
        }]
    },
    apps_integrees: [{
        nom: String,
        api_key: String,
        webhook_url: String,
        statut: {
            type: String,
            enum: ['actif', 'inactif', 'erreur'],
            default: 'inactif'
        }
    }],
    statistiques: {
        executions_reussies: {
            type: Number,
            default: 0
        },
        executions_echouees: {
            type: Number,
            default: 0
        },
        dernier_execution: Date,
        temps_moyen_execution: Number
    }
});

// Méthode pour créer un scénario Make
makeScenarioSchema.methods.creerScenario = async function(this: IMakeScenario): Promise<any> {
    try {
        // Logique pour créer un scénario via l'API Make
        const scenario = {
            nom: this.nom,
            type: this.type,
            configuration: {
                declencheurs: this.genererDeclencheurs(),
                actions: this.genererActions()
            }
        };

        // Retourner le scénario créé
        return scenario;
    } catch (error) {
        throw new Error(`Erreur lors de la création du scénario Make: ${error.message}`);
    }
};

// Méthode pour générer les déclencheurs
makeScenarioSchema.methods.genererDeclencheurs = function(this: IMakeScenario): Trigger[] {
    const declencheurs: Trigger[] = [];

    switch (this.type) {
        case 'vente':
            declencheurs.push({
                app: 'CRM',
                evenement: 'nouveau_lead',
                conditions: ['score > 50']
            });
            declencheurs.push({
                app: 'Email',
                evenement: 'reponse_recue',
                conditions: ['intention_achat']
            });
            break;

        case 'marketing':
            declencheurs.push({
                app: 'LinkedIn',
                evenement: 'nouveau_post',
                conditions: ['hashtags_pertinents']
            });
            declencheurs.push({
                app: 'Site_Web',
                evenement: 'formulaire_soumis',
                conditions: ['page_produit']
            });
            break;

        case 'prospection':
            declencheurs.push({
                app: 'LinkedIn Sales Navigator',
                evenement: 'nouveau_prospect',
                conditions: ['criteres_matching']
            });
            declencheurs.push({
                app: 'Email',
                evenement: 'ouverture_email',
                conditions: ['sequence_prospection']
            });
            break;
    }

    return declencheurs;
};

// Méthode pour générer les actions
makeScenarioSchema.methods.genererActions = function(this: IMakeScenario): Action[] {
    const actions: Action[] = [];

    switch (this.type) {
        case 'vente':
            actions.push({
                app: 'CRM',
                action: 'mettre_a_jour_lead',
                parametres: {
                    statut: 'qualifie',
                    score: 'calcul_dynamique'
                }
            });
            actions.push({
                app: 'Email',
                action: 'envoyer_proposition',
                parametres: {
                    template: 'proposition_personnalisee',
                    variables: ['nom', 'entreprise', 'besoins']
                }
            });
            break;

        case 'marketing':
            actions.push({
                app: 'LinkedIn',
                action: 'commenter_post',
                parametres: {
                    message: 'message_personnalise',
                    hashtags: ['pertinents']
                }
            });
            actions.push({
                app: 'Email',
                action: 'ajouter_sequence',
                parametres: {
                    sequence: 'nurturing',
                    segmentation: 'interet_produit'
                }
            });
            break;

        case 'prospection':
            actions.push({
                app: 'LinkedIn',
                action: 'envoyer_invitation',
                parametres: {
                    message: 'template_personnalise',
                    suivi: true
                }
            });
            actions.push({
                app: 'CRM',
                action: 'creer_prospect',
                parametres: {
                    source: 'linkedin',
                    pipeline: 'prospection_auto'
                }
            });
            break;
    }

    return actions;
};

// Méthode pour mettre à jour les statistiques
makeScenarioSchema.methods.mettreAJourStats = async function(this: IMakeScenario, execution: Execution): Promise<void> {
    if (execution.reussi) {
        this.statistiques.executions_reussies++;
    } else {
        this.statistiques.executions_echouees++;
    }

    this.statistiques.dernier_execution = new Date();
    this.statistiques.temps_moyen_execution = this.calculerTempsMoyenExecution(execution.duree);

    await this.save();
};

// Méthode pour calculer le temps moyen d'exécution
makeScenarioSchema.methods.calculerTempsMoyenExecution = function(this: IMakeScenario, duree: number): number {
    const totalExecutions = this.statistiques.executions_reussies + this.statistiques.executions_echouees;
    const ancienTemps = this.statistiques.temps_moyen_execution || 0;
    
    return ((ancienTemps * (totalExecutions - 1)) + duree) / totalExecutions;
};

// Méthode statique pour créer un scénario à partir du langage naturel
makeScenarioSchema.statics.creerScenarioDepuisTexte = async function(
    this: IMakeScenarioModel,
    texte: string
): Promise<IMakeScenario> {
    try {
        // Analyser le type de scénario
        let type: ScenarioType = 'prospection';
        if (texte.toLowerCase().includes('vente') || texte.toLowerCase().includes('client')) {
            type = 'vente';
        } else if (texte.toLowerCase().includes('marketing') || texte.toLowerCase().includes('promotion')) {
            type = 'marketing';
        }

        // Extraire le nom et la description
        const nom = `Scénario ${type} ${Date.now()}`;
        const description = texte;

        // Créer le scénario
        const scenario = new this({
            nom,
            description,
            type,
            scenario_id: `MAKE_${Date.now()}`
        });

        // Personnaliser les déclencheurs en fonction du texte
        const declencheurs: Trigger[] = [];
        if (texte.toLowerCase().includes('linkedin')) {
            declencheurs.push({
                app: 'LinkedIn',
                evenement: 'nouveau_prospect',
                conditions: ['profil_matching']
            });
        }
        if (texte.toLowerCase().includes('email') || texte.toLowerCase().includes('mail')) {
            declencheurs.push({
                app: 'Email',
                evenement: 'reponse_recue',
                conditions: ['contenu_positif']
            });
        }
        if (texte.toLowerCase().includes('site') || texte.toLowerCase().includes('web')) {
            declencheurs.push({
                app: 'Site_Web',
                evenement: 'formulaire_soumis',
                conditions: ['page_pertinente']
            });
        }

        // Ajouter les déclencheurs au scénario
        scenario.configuration = {
            declencheurs,
            actions: scenario.genererActions()
        };

        await scenario.save();
        return scenario;
    } catch (error) {
        throw new Error(`Erreur lors de la création du scénario depuis le texte: ${error.message}`);
    }
};

export const MakeScenario = mongoose.model<IMakeScenario, IMakeScenarioModel>('MakeScenario', makeScenarioSchema); 