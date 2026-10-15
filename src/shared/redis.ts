import { Redis } from 'ioredis';

import config from '../config';

const redisClient = new Redis(config.redis_url, {
  maxRetriesPerRequest: 2,
  lazyConnect: true,
  retryStrategy: (attempt) => Math.min(attempt * 100, 3000),
});

redisClient.on('error', (error: Error) => {
  console.error('[redis] connection error:', error.message);
});

redisClient.on('connect', () => {
  console.log('[redis] connected');
});

const connectRedis = async (): Promise<void> => {
  if (redisClient.status === 'wait' || redisClient.status === 'close' || redisClient.status === 'end') {
    await redisClient.connect();
  }
};

const disconnectRedis = async (): Promise<void> => {
  if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
    await redisClient.quit();
  }
};

export const RedisService = {
  client: redisClient,
  connectRedis,
  disconnectRedis,
};

export { redisClient };
