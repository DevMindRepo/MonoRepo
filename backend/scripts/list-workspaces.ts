import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      members: { include: { user: true } },
      _count: { select: { memories: true, pendingMemories: true, agentRuns: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (workspaces.length === 0) {
    console.log('No workspaces found. Connect a wallet and create one first.');
    return;
  }

  console.log(`Found ${workspaces.length} workspace(s):\n`);
  for (const ws of workspaces) {
    console.log(`📁 ${ws.name}`);
    console.log(`   ID:           ${ws.id}`);
    console.log(`   Sui Object:   ${ws.suiObjectId ?? '(not on-chain)'}`);
    console.log(`   Owner:        ${ws.ownerId}`);
    console.log(`   Members:      ${ws.members.length}`);
    ws.members.forEach((m) => {
      console.log(`     - ${m.user.suiAddress} (${m.role})`);
    });
    console.log(`   Memories:     ${ws._count.memories} approved, ${ws._count.pendingMemories} pending`);
    console.log(`   Agent runs:   ${ws._count.agentRuns}`);
    console.log(`   Created:      ${ws.createdAt.toISOString()}`);
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
