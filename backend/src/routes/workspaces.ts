import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  createWorkspaceOnChain,
  inviteMemberOnChain,
  removeMemberOnChain,
} from '../services/sui.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
});

const memberSchema = z.object({
  suiAddress: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

export default async function workspaceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // List workspaces user belongs to
  app.get('/workspaces', async (req) => {
    const memberships = await app.prisma.workspaceMember.findMany({
      where: { userId: req.user.userId },
      include: { workspace: true },
      orderBy: { joinedAt: 'desc' },
    });

    return {
      success: true,
      data: memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };
  });

  // Create new workspace (chain + DB + provision MemWal namespace)
  app.post('/workspaces', async (req) => {
    const { name } = createWorkspaceSchema.parse(req.body);

    const chain = await createWorkspaceOnChain({ name, walrusRoot: '' });

    // MemWal namespace = stable, workspace-scoped string. Use the on-chain workspace ID
    // when available (collision-free across instances), else fall back to a slugified name + random.
    const memwalNamespace =
      chain.workspaceId.replace(/^0x/, '').slice(0, 32) ??
      `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

    const workspace = await app.prisma.workspace.create({
      data: {
        name,
        ownerId: req.user.userId,
        suiObjectId: chain.workspaceId,
        memwalNamespace,
        members: {
          create: { userId: req.user.userId, role: 'owner' },
        },
      },
    });

    return {
      success: true,
      data: { ...workspace, txDigest: chain.txDigest },
    };
  });

  // Get single workspace
  app.get('/workspaces/:id', async (req) => {
    const { id } = req.params as { id: string };
    const workspace = await app.prisma.workspace.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
    if (!workspace) throw new NotFoundError('Workspace');

    const isMember = workspace.members.some((m) => m.userId === req.user.userId);
    if (!isMember) throw new ForbiddenError('Not a workspace member');

    return { success: true, data: workspace };
  });

  // Invite member (owner only) — both chain + DB
  app.post('/workspaces/:id/members', async (req) => {
    const { id } = req.params as { id: string };
    const { suiAddress } = memberSchema.parse(req.body);

    const workspace = await app.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundError('Workspace');
    if (workspace.ownerId !== req.user.userId) throw new ForbiddenError('Only owner can invite');
    if (!workspace.suiObjectId) throw new NotFoundError('Workspace on-chain object');

    let invitee = await app.prisma.user.findUnique({ where: { suiAddress } });
    if (!invitee) {
      invitee = await app.prisma.user.create({ data: { suiAddress } });
    }

    const txDigest = await inviteMemberOnChain({
      workspaceObjectId: workspace.suiObjectId,
      newMember: suiAddress,
    });

    await app.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: id, userId: invitee.id } },
      create: { workspaceId: id, userId: invitee.id, role: 'member' },
      update: {},
    });

    return { success: true, data: { txDigest } };
  });

  // Remove member (owner only)
  app.delete('/workspaces/:id/members/:userId', async (req) => {
    const { id, userId } = req.params as { id: string; userId: string };

    const workspace = await app.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundError('Workspace');
    if (workspace.ownerId !== req.user.userId) throw new ForbiddenError('Only owner can remove');
    if (!workspace.suiObjectId) throw new NotFoundError('Workspace on-chain object');

    const target = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundError('User');

    const txDigest = await removeMemberOnChain({
      workspaceObjectId: workspace.suiObjectId,
      member: target.suiAddress,
    });

    await app.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId: id, userId } },
    });

    return { success: true, data: { txDigest } };
  });
}
