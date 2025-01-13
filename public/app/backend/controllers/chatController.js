const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

const handleMessage = async (req, res) => {
    try {
        const { message } = req.body;
        
        // Traitement du message
        const response = {
            message: `Réponse au message: ${message}`,
            timestamp: new Date()
        };

        logger.info('Message traité avec succès', { message });
        return successResponse(res, response);
    } catch (error) {
        logger.error('Erreur lors du traitement du message:', error);
        return errorResponse(res, error, 'Erreur lors du traitement du message');
    }
};

const handleAction = async (req, res) => {
    try {
        const { action } = req.body;
        let responseData;

        switch (action) {
            case 'seo':
                responseData = {
                    message: 'Analyse SEO en cours...',
                    data: {
                        title: 'Page d\'exemple',
                        metaTags: {
                            description: 'Description de la page',
                            keywords: ['mot-clé1', 'mot-clé2']
                        },
                        headings: {
                            h1Count: 1,
                            h2Count: 3,
                            structure: 'Bonne'
                        },
                        images: {
                            total: 5,
                            withAlt: 4,
                            withoutAlt: 1
                        },
                        recommendations: [
                            'Ajoutez un attribut alt à l\'image manquante',
                            'Optimisez le titre de la page'
                        ]
                    }
                };
                break;

            case 'editor':
                responseData = {
                    message: 'Éditeur prêt',
                    data: {
                        status: 'actif',
                        mode: 'édition',
                        message: 'Vous pouvez commencer à éditer'
                    }
                };
                break;

            default:
                return errorResponse(res, new Error('Action non reconnue'), `Action ${action} non reconnue`, 400);
        }

        logger.info('Action traitée avec succès', { action });
        return successResponse(res, responseData);
    } catch (error) {
        logger.error('Erreur lors du traitement de l\'action:', error);
        return errorResponse(res, error, 'Erreur lors du traitement de l\'action');
    }
};

module.exports = {
    handleMessage,
    handleAction
};
