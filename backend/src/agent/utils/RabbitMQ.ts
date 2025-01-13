import * as amqp from 'amqplib';

export interface RabbitMessage {
    type: string;
    data: Record<string, unknown>;
    timestamp: Date;
}

export class RabbitMQ {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private readonly url: string;
    private readonly reconnectDelay = 5000;
    private readonly maxReconnectAttempts = 5;

    constructor(url: string) {
        this.url = url;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();

            this.connection.on('error', (error) => {
                console.error('Erreur de connexion RabbitMQ:', error);
                this.reconnect();
            });

            this.connection.on('close', () => {
                console.warn('Connexion RabbitMQ fermée');
                this.reconnect();
            });
        } catch (error) {
            console.error('Erreur lors de la connexion à RabbitMQ:', error);
            throw error;
        }
    }

    private async reconnect(attempt: number = 1): Promise<void> {
        if (attempt > this.maxReconnectAttempts) {
            console.error('Nombre maximum de tentatives de reconnexion atteint');
            return;
        }

        console.log(`Tentative de reconnexion ${attempt}/${this.maxReconnectAttempts}...`);

        try {
            await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
            await this.connect();
            console.log('Reconnexion réussie');
        } catch (error) {
            console.error(`Échec de la tentative de reconnexion ${attempt}:`, error);
            await this.reconnect(attempt + 1);
        }
    }

    async createQueue(queue: string): Promise<void> {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ non initialisé');
        }

        await this.channel.assertQueue(queue, {
            durable: true,
            deadLetterExchange: 'dlx',
            messageTtl: 30000 // 30 secondes
        });

        // Configuration de l'exchange de lettres mortes
        await this.channel.assertExchange('dlx', 'direct');
        await this.channel.assertQueue('dead-letter-queue');
        await this.channel.bindQueue('dead-letter-queue', 'dlx', '');
    }

    async publish(queue: string, message: RabbitMessage): Promise<boolean> {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ non initialisé');
        }

        try {
            const success = this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
                expiration: '30000', // 30 secondes
                headers: {
                    'x-retry-count': 0
                }
            });

            if (!success) {
                console.warn(`Message non publié dans la file ${queue} (buffer plein)`);
            }

            return success;
        } catch (error) {
            console.error('Erreur lors de la publication du message:', error);
            throw error;
        }
    }

    async consume(queue: string, callback: (message: RabbitMessage) => void): Promise<void> {
        if (!this.channel) {
            throw new Error('Canal RabbitMQ non initialisé');
        }

        try {
            await this.channel.consume(queue, (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString()) as RabbitMessage;
                        callback(content);
                        this.channel?.ack(msg);
                    } catch (error) {
                        console.error('Erreur lors du traitement du message:', error);
                        // Gestion des erreurs de traitement
                        const retryCount = (msg.properties.headers?.['x-retry-count'] ?? 0) + 1;
                        if (retryCount <= 3) {
                            // Republier avec compteur de tentatives incrémenté
                            this.channel?.nack(msg, false, false);
                        } else {
                            // Envoyer vers la file des lettres mortes
                            this.channel?.reject(msg, false);
                        }
                    }
                }
            }, {
                noAck: false
            });
        } catch (error) {
            console.error('Erreur lors de la configuration du consommateur:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
        } catch (error) {
            console.error('Erreur lors de la fermeture de la connexion RabbitMQ:', error);
            throw error;
        }
    }
} 