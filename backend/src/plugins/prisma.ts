import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (app: FastifyInstance) => {
  // Set LOG_PRISMA_QUERIES=true to see every SQL query (very noisy with polling).
  const verbose = process.env.LOG_PRISMA_QUERIES === 'true';
  const prisma = new PrismaClient({
    log: verbose ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });

  await prisma.$connect();
  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
