import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import config from '../config';

const createPrismaClient = (): PrismaClient => {
  const pool = new Pool({ connectionString: config.database_url });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: config.isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
