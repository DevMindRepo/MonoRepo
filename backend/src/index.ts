import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import rawBody from 'fastify-raw-body';

import { getEnv } from './lib/env.js';
import prismaPlugin from './plugins/prisma.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import errorHandler from './plugins/error-handler.js';

import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspaces.js';
import memoryRoutes from './routes/memories.js';
import pendingRoutes from './routes/pending.js';
import artifactRoutes from './routes/artifacts.js';
import githubWebhookRoutes from './routes/webhook/github.js';
import apiTokenRoutes from './routes/api-tokens.js';
import statsRoutes from './routes/stats.js';
import webhookRoutes from './routes/webhooks.js';
import agentRunRoutes from './routes/agent-runs.js';
import incidentRoutes from './routes/incidents.js';
import { startIncidentWorker } from './workers/incident-worker.js';

async function main() {
  const env = getEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
    },
    bodyLimit: 10 * 1024 * 1024,
  });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(rawBody, { field: 'rawBody', global: false, encoding: 'utf8', runFirst: true });
  await app.register(errorHandler);
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(authPlugin);
  await app.register(websocket);

  app.get('/health', async () => ({
    status: 'ok',
    network: env.SUI_NETWORK,
    ts: Date.now(),
  }));

  await app.register(authRoutes);
  await app.register(workspaceRoutes);
  await app.register(memoryRoutes);
  await app.register(pendingRoutes);
  await app.register(artifactRoutes);
  await app.register(githubWebhookRoutes);
  await app.register(apiTokenRoutes);
  await app.register(statsRoutes);
  await app.register(webhookRoutes);
  await app.register(agentRunRoutes);
  await app.register(incidentRoutes);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info(`DevMind API listening on :${env.PORT} (${env.SUI_NETWORK})`);

  // Long-running worker: poll Redis queue for incident IDs, run agent pipeline.
  startIncidentWorker(app).catch((err) => {
    app.log.error({ err }, 'Incident worker crashed');
  });

  const shutdown = async () => {
    app.log.info('Shutting down...');
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
