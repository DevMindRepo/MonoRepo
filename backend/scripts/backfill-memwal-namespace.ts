/**
 * Backfill memwalNamespace for workspaces that don't have one yet.
 * Uses the Sui object ID (stripped of 0x prefix, first 32 chars) as the namespace.
 *
 * Run once after upgrading from pre-MemWal schema:
 *   pnpm dotenv -e ../.env -- tsx scripts/backfill-memwal-namespace.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workspaces = await prisma.workspace.findMany({
    where: { memwalNamespace: null },
    select: { id: true, name: true, suiObjectId: true },
  });

  if (workspaces.length === 0) {
    console.log('No workspaces need backfilling.');
    return;
  }

  console.log(`Backfilling ${workspaces.length} workspace(s)…\n`);

  for (const ws of workspaces) {
    const namespace = ws.suiObjectId
      ? ws.suiObjectId.replace(/^0x/, '').slice(0, 32)
      : `${ws.id.slice(0, 16)}-ns`;

    await prisma.workspace.update({
      where: { id: ws.id },
      data: { memwalNamespace: namespace },
    });

    console.log(`✓ ${ws.name} (${ws.id}) → namespace="${namespace}"`);
  }

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
