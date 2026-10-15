import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../shared/redis';
import { ApiError } from '../errors/ApiError';

interface IRateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
  message?: string;
  redisTimeoutMs?: number;
}

const DEFAULT_REDIS_TIMEOUT_MS = 300;

const withTimeout = <T>(pendingOperation: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutBarrier = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error('Rate limiter cache lookup exceeded its time budget')),
      timeoutMs
    );
  });

  return Promise.race([pendingOperation, timeoutBarrier]).finally(() => clearTimeout(timeoutHandle));
};

const resolveClientIdentity = (req: Request): string => {
  if (req.user?.id) return `user:${req.user.id}`;
  return `ip:${req.ip ?? 'unknown'}`;
};

export const rateLimiter =
  ({
    windowSeconds,
    maxRequests,
    keyPrefix = 'ratelimit',
    message = 'Request volume exceeded the allowed throughput ceiling, retry later!',
    redisTimeoutMs = DEFAULT_REDIS_TIMEOUT_MS,
  }: IRateLimitOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const counterKey = `${keyPrefix}:${resolveClientIdentity(req)}`;

    try {
      const hitCount = await withTimeout(RedisService.client.incr(counterKey), redisTimeoutMs);

      if (hitCount === 1) {
        await withTimeout(RedisService.client.expire(counterKey, windowSeconds), redisTimeoutMs);
      }

      const remainingSeconds = await withTimeout(RedisService.client.ttl(counterKey), redisTimeoutMs);
      const resetEpochSeconds = Math.floor(Date.now() / 1000) + Math.max(remainingSeconds, 0);
      const remainingQuota = Math.max(maxRequests - hitCount, 0);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remainingQuota);
      res.setHeader('X-RateLimit-Reset', resetEpochSeconds);

      if (hitCount > maxRequests) {
        res.setHeader('Retry-After', Math.max(remainingSeconds, 1));
        return next(new ApiError(429, message));
      }

      next();
    } catch (error) {
      console.error(' Rate limiter cache channel degraded, bypassing throttle guard:', error);
      next();
    }
  };

export const rateLimiters = {
  global: rateLimiter({ windowSeconds: 60, maxRequests: 120, keyPrefix: 'ratelimit:global' }),
  auth: rateLimiter({ windowSeconds: 15 * 60, maxRequests: 10, keyPrefix: 'ratelimit:auth' }),
  write: rateLimiter({ windowSeconds: 60, maxRequests: 20, keyPrefix: 'ratelimit:write' }),
};