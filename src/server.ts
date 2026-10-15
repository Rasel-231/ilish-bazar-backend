import type { Server } from 'http';

import app from './app';
import config from './config';
import { disconnectPrisma } from './shared/prisma';
import { RedisService } from './shared/redis';

let server: Server | undefined;
let isShuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`[server] ${signal} received. Shutting down gracefully...`);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await Promise.allSettled([disconnectPrisma(), RedisService.disconnectRedis()]);

  console.log('[server] shutdown complete.');
  process.exit(0);
};

const registerProcessHandlers = (): void => {
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandled promise rejection:', reason);
    void shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    console.error('[server] uncaught exception:', error);
    void shutdown('uncaughtException');
  });
};

const bootstrap = async (): Promise<void> => {
  try {
    await RedisService.connectRedis();

    server = app.listen(config.port, () => {
      console.log(`[server] running on http://localhost:${config.port} (${config.env})`);
    });

    registerProcessHandlers();
  } catch (error) {
    console.error('[server] failed to start:', error);
    process.exit(1);
  }
};

void bootstrap();
