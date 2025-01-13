import { Client } from '@elastic/elasticsearch';

export interface ElasticsearchConfig {
    node: string;
    auth?: {
        username: string;
        password: string;
    };
}

interface ElasticsearchError extends Error {
    statusCode?: number;
}

export class ElasticsearchService {
    private readonly client: Client;

    constructor(config: ElasticsearchConfig) {
        this.client = new Client({
            node: config.node,
            auth: config.auth
        });
    }

    async createIndex(index: string, mappings: Record<string, unknown>): Promise<void> {
        try {
            const exists = await this.client.indices.exists({ index });
            if (!exists) {
                await this.client.indices.create({
                    index,
                    body: {
                        mappings
                    }
                });
            }
        } catch (error) {
            console.error(`Erreur lors de la création de l'index ${index}:`, error);
            throw error;
        }
    }

    async index(index: string, id: string, document: Record<string, unknown>): Promise<void> {
        await this.client.index({
            index,
            id,
            document
        });
    }

    async search<T>(
        index: string,
        query: Record<string, unknown>
    ): Promise<T[]> {
        try {
            const { hits } = await this.client.search({
                index,
                body: {
                    query
                }
            });

            return hits.hits.map(hit => hit._source as T);
        } catch (error) {
            console.error(`Erreur lors de la recherche dans ${index}:`, error);
            throw error;
        }
    }

    async get<T>(index: string, id: string): Promise<T | null> {
        try {
            const { _source } = await this.client.get({
                index,
                id
            });

            return _source as T;
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error && (error as ElasticsearchError).statusCode === 404) {
                return null;
            }
            console.error(`Erreur lors de la récupération du document ${id} dans ${index}:`, error);
            throw error;
        }
    }

    async update<T extends Record<string, unknown>>(
        index: string,
        id: string,
        document: Partial<T>
    ): Promise<void> {
        try {
            await this.client.update({
                index,
                id,
                body: {
                    doc: document
                }
            });
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du document ${id} dans ${index}:`, error);
            throw error;
        }
    }

    async delete(index: string, id: string): Promise<void> {
        try {
            await this.client.delete({
                index,
                id
            });
        } catch (error) {
            console.error(`Erreur lors de la suppression du document ${id} dans ${index}:`, error);
            throw error;
        }
    }

    async bulk<T extends Record<string, unknown>>(
        operations: Array<{
            index: string;
            id?: string;
            document: T;
        }>
    ): Promise<void> {
        try {
            const body = operations.flatMap(op => [
                {
                    index: {
                        _index: op.index,
                        _id: op.id
                    }
                },
                op.document
            ]);

            await this.client.bulk({ body });
        } catch (error) {
            console.error('Erreur lors de l\'opération bulk:', error);
            throw error;
        }
    }

    async getStats(index: string): Promise<{
        count: number;
        size: number;
    }> {
        try {
            const stats = await this.client.indices.stats({
                index
            });

            const indexStats = stats.indices?.[index]?.total;
            return {
                count: indexStats?.docs?.count ?? 0,
                size: indexStats?.store?.size_in_bytes ?? 0
            };
        } catch (error) {
            console.error(`Erreur lors de la récupération des statistiques pour ${index}:`, error);
            throw error;
        }
    }
} 