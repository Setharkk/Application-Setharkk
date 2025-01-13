import amqp from 'amqplib';

export interface RabbitMessage {
    type: string;
    data: Record<string, unknown>;
    timestamp: Date;
}

export class RabbitMQ {
    private connection?: amqp.Connection;
    private channel?: amqp.Channel;

    constructor(private readonly url: string) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
        } catch (error) {
            console.error('Erreur lors de la connexion à RabbitMQ:', error);
            throw error;
        }
    }

    async createQueue(queue: string): Promise<void> {
        try {
            if (!this.channel) {
                throw new Error('Canal RabbitMQ non initialisé');
            }
            await this.channel.assertQueue(queue, { durable: true });
        } catch (error) {
            console.error(`Erreur lors de la création de la file d'attente ${queue}:`, error);
            throw error;
        }
    }

    async publish(queue: string, message: RabbitMessage): Promise<void> {
        try {
            if (!this.channel) {
                throw new Error('Canal RabbitMQ non initialisé');
            }
            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        } catch (error) {
            console.error(`Erreur lors de la publication du message dans ${queue}:`, error);
            throw error;
        }
    }

    async consume(queue: string, callback: (message: RabbitMessage) => void): Promise<void> {
        try {
            if (!this.channel) {
                throw new Error('Canal RabbitMQ non initialisé');
            }
            await this.channel.consume(queue, (msg) => {
                if (msg) {
                    try {
                        const message = JSON.parse(msg.content.toString()) as RabbitMessage;
                        callback(message);
                        this.channel?.ack(msg);
                    } catch (error) {
                        console.error('Erreur lors du traitement du message:', error);
                        this.channel?.nack(msg);
                    }
                }
            });
        } catch (error) {
            console.error(`Erreur lors de la consommation de la file d'attente ${queue}:`, error);
            throw error;
        }
    }

    async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (error) {
            console.error('Erreur lors de la fermeture de la connexion RabbitMQ:', error);
            throw error;
        }
    }
} 