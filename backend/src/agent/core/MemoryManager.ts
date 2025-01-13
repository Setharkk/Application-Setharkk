import { Redis } from 'ioredis';
import { Client } from '@elastic/elasticsearch';
import { Config } from '../../config/config';

interface Memory {
    id: string;
    type: string;
    content: Record<string, unknown>;
    timestamp: Date;
    tags: string[];
    metadata: Record<string, unknown>;
}

export class MemoryManager {
    private readonly redis: Redis;
    private readonly elasticsearch: Client;
    private readonly memoryIndex = 'memories';

    constructor(private readonly config: Config) {
        this.redis = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
        });

        this.elasticsearch = new Client({
            node: config.elasticsearch.node,
            auth: config.elasticsearch.auth
        });
    }

    async initialize(): Promise<void> {
        try {
            // Vérifier et créer l'index si nécessaire
            const indexExists = await this.elasticsearch.indices.exists({
                index: this.memoryIndex
            });

            if (!indexExists) {
                await this.elasticsearch.indices.create({
                    index: this.memoryIndex,
                    body: {
                        mappings: {
                            properties: {
                                id: { type: 'keyword' },
                                type: { type: 'keyword' },
                                content: { type: 'object' },
                                timestamp: { type: 'date' },
                                tags: { type: 'keyword' },
                                metadata: { type: 'object' }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du gestionnaire de mémoire:', error);
            throw error;
        }
    }

    async storeMemory(memory: Memory): Promise<void> {
        try {
            await this.elasticsearch.index({
                index: this.memoryIndex,
                id: memory.id,
                body: memory
            });

            // Stocker dans Redis pour un accès rapide
            await this.redis.setex(
                `memory:${memory.id}`,
                3600, // 1 heure
                JSON.stringify(memory)
            );
        } catch (error) {
            console.error('Erreur lors du stockage de la mémoire:', error);
            throw error;
        }
    }

    async getMemory(id: string): Promise<Memory | null> {
        try {
            // Essayer d'abord Redis
            const cachedMemory = await this.redis.get(`memory:${id}`);
            if (cachedMemory) {
                return JSON.parse(cachedMemory);
            }

            // Si pas dans Redis, chercher dans Elasticsearch
            const result = await this.elasticsearch.get({
                index: this.memoryIndex,
                id: id
            });

            if (result.found) {
                const memory = result._source as Memory;
                // Mettre en cache dans Redis
                await this.redis.setex(
                    `memory:${id}`,
                    3600,
                    JSON.stringify(memory)
                );
                return memory;
            }

            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération de la mémoire:', error);
            return null;
        }
    }

    async searchMemories(query: string, filters?: Record<string, unknown>): Promise<Memory[]> {
        try {
            const searchBody: any = {
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: query,
                                    fields: ['content^2', 'tags', 'metadata']
                                }
                            }
                        ]
                    }
                }
            };

            if (filters) {
                searchBody.query.bool.filter = Object.entries(filters).map(([key, value]) => ({
                    term: { [key]: value }
                }));
            }

            const response = await this.elasticsearch.search({
                index: this.memoryIndex,
                body: searchBody
            });

            return response.hits.hits.map(hit => hit._source as Memory);
        } catch (error) {
            console.error('Erreur lors de la recherche de mémoires:', error);
            return [];
        }
    }

    async deleteMemory(id: string): Promise<void> {
        try {
            await this.elasticsearch.delete({
                index: this.memoryIndex,
                id: id
            });

            await this.redis.del(`memory:${id}`);
        } catch (error) {
            console.error('Erreur lors de la suppression de la mémoire:', error);
            throw error;
        }
    }

    async getMemoryStats(): Promise<{ count: number; size: number }> {
        try {
            const stats = await this.elasticsearch.indices.stats({
                index: this.memoryIndex
            });

            return {
                count: stats.indices?.[this.memoryIndex]?.total?.docs?.count ?? 0,
                size: stats.indices?.[this.memoryIndex]?.total?.store?.size_in_bytes ?? 0
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques de mémoire:', error);
            return { count: 0, size: 0 };
        }
    }

    async cleanup(): Promise<void> {
        try {
            await this.redis.quit();
            await this.elasticsearch.close();
        } catch (error) {
            console.error('Erreur lors du nettoyage du gestionnaire de mémoire:', error);
            throw error;
        }
    }
} 