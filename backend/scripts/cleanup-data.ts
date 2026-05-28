/**
 * Cleanup all demo data: memories, artifacts, agent runs, pending queue.
 * Workspaces, users, and API tokens are PRESERVED (so MCP config doesn't break).
 *
 * Usage:
 *   pnpm dotenv -e ../.env -- tsx scripts/cleanup-data.ts
 *
 * Note: MemWal blobs on Walrus testnet remain. They will expire after their epoch.
 * Only the local Postgres metadata is wiped.
 */
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

async function main() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('REDIS_URL required');
    process.exit(1);
  }
  const redis = new Redis(redisUrl);

  console.log('Wiping demo data…\n');

  // 1. Memories
  const memCount = await prisma.memory.deleteMany({});
  console.log(`✓ Deleted ${memCount.count} memories`);

  // 2. Artifacts
  const artCount = await prisma.artifact.deleteMany({});
  console.log(`✓ Deleted ${artCount.count} artifacts`);

  // 3. Agent runs
  const runCount = await prisma.agentRun.deleteMany({});
  console.log(`✓ Deleted ${runCount.count} agent runs`);

  // 4. Pending memories (Postgres mirror)
  const pendingDbCount = await prisma.pendingMemory.deleteMany({});
  console.log(`✓ Deleted ${pendingDbCount.count} pending memory DB rows`);

  // 5. Pending memories (Redis queue)
  const pendingKeys = await redis.keys('pending:*');
  if (pendingKeys.length > 0) {
    await redis.del(...pendingKeys);
    console.log(`✓ Deleted ${pendingKeys.length} pending Redis entries`);
  } else {
    console.log('✓ Redis pending queue already empty');
  }
  const wsListKeys = await redis.keys('pending-list:*');
  if (wsListKeys.length > 0) {
    await redis.del(...wsListKeys);
    console.log(`✓ Deleted ${wsListKeys.length} workspace pending-list keys`);
  }

  // 6. Summary of what was preserved
  const wsCount = await prisma.workspace.count();
  const userCount = await prisma.user.count();
  const tokenCount = await prisma.apiToken.count({ where: { revokedAt: null } });
  console.log('\nPreserved:');
  console.log(`  - ${wsCount} workspace(s)`);
  console.log(`  - ${userCount} user(s)`);
  console.log(`  - ${tokenCount} active API token(s)`);

  await redis.quit();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
