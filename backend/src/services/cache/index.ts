import { BaseService } from '../base/BaseService';
import { ServiceType } from '../../types/service';
import logger from '../logger';
import Redis from 'ioredis';

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    memory: {
        used: number;
        peak: number;
    };
    uptime: number;
}

interface CacheValue {
    data: unknown;
    type: string;
    timestamp: number;
}

export class CacheService extends BaseService {
    private readonly redis: Redis;
    private stats: CacheStats;

    constructor() {
        super({
            id: 'cache-service',
            name: 'Service de Cache',
            type: ServiceType.CACHE,
            dependencies: []
        }, {
            version: '1.0.0',
            description: 'Service de gestion du cache',
            author: 'Setharkk',
            tags: ['cache', 'redis']
        });

        this.redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
            memory: { used: 0, peak: 0 },
            uptime: 0
        };
    }

    protected async doInitialize(): Promise<void> {
        try {
            logger.info('Service de cache initialisé');
        } catch (error) {
            logger.error('Erreur lors de l\'initialisation du service de cache:', error);
            throw error;
        }
    }

    protected async doShutdown(): Promise<void> {
        logger.info('Shutting down Cache service');
        await this.redis.quit();
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            if (value) {
                this.stats.hits++;
                const cacheValue = JSON.parse(value) as CacheValue;
                return cacheValue.data as T;
            }
            this.stats.misses++;
            return null;
        } catch (error) {
            logger.error(`Erreur lors de la récupération de la clé ${key}:`, error);
            throw error;
        }
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            const cacheValue: CacheValue = {
                data: value,
                type: typeof value,
                timestamp: Date.now()
            };
            const serializedValue = JSON.stringify(cacheValue);
            if (ttl) {
                await this.redis.setex(key, ttl, serializedValue);
            } else {
                await this.redis.set(key, serializedValue);
            }
            logger.debug(`Valeur mise en cache pour la clé ${key}`);
        } catch (error) {
            logger.error(`Erreur lors de la mise en cache pour la clé ${key}:`, error);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key);
            logger.debug(`Clé ${key} supprimée du cache`);
        } catch (error) {
            logger.error(`Erreur lors de la suppression de la clé ${key}:`, error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            await this.redis.flushall();
            this.stats = { 
                hits: 0, 
                misses: 0, 
                size: 0,
                memory: { used: 0, peak: 0 },
                uptime: 0
            };
            logger.info('Cache vidé avec succès');
        } catch (error) {
            logger.error('Erreur lors du vidage du cache:', error);
            throw error;
        }
    }

    async getStats(): Promise<CacheStats> {
        try {
            const info = await this.redis.info();
            const memory = await this.redis.info('memory');
            const keyCount = await this.redis.dbsize();

            // Parse Redis INFO command output
            const memoryMatch = /used_memory:(\d+)/.exec(memory);
            const memoryPeakMatch = /used_memory_peak:(\d+)/.exec(memory);
            const uptimeMatch = /uptime_in_seconds:(\d+)/.exec(info);

            return {
                hits: this.stats.hits,
                misses: this.stats.misses,
                size: keyCount,
                memory: {
                    used: memoryMatch ? parseInt(memoryMatch[1]) : 0,
                    peak: memoryPeakMatch ? parseInt(memoryPeakMatch[1]) : 0
                },
                uptime: uptimeMatch ? parseInt(uptimeMatch[1]) : 0
            };
        } catch (error) {
            logger.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }

    async getKeys(pattern: string = '*'): Promise<string[]> {
        try {
            return await this.redis.keys(pattern);
        } catch (error) {
            logger.error('Erreur lors de la récupération des clés:', error);
            throw error;
        }
    }

    async getTtl(key: string): Promise<number> {
        try {
            return await this.redis.ttl(key);
        } catch (error) {
            logger.error(`Erreur lors de la récupération du TTL pour la clé ${key}:`, error);
            throw error;
        }
    }

    async setTtl(key: string, ttl: number): Promise<void> {
        try {
            await this.redis.expire(key, ttl);
            logger.debug(`TTL mis à jour pour la clé ${key}`);
        } catch (error) {
            logger.error(`Erreur lors de la mise à jour du TTL pour la clé ${key}:`, error);
            throw error;
        }
    }
}

export const cacheService = new CacheService(); 