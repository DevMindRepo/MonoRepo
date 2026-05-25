import type { FastifyInstance } from 'fastify';
import { listPendingForWorkspace } from '../services/pending-queue.js';
import { ForbiddenError, BadRequestError } from '../lib/errors.js';

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

export default async function statsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // GET /stats?workspaceId=xxx — dashboard overview metrics
  app.get('/stats', async (req) => {
    const { workspaceId } = req.query as { workspaceId?: string };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const [
      totalMemories,
      memoriesThisWeek,
      byTypeRaw,
      pendingItems,
      agentRunsTotal,
      agentRunsThisWeek,
      artifactsSize,
      artifactsCount,
    ] = await Promise.all([
      app.prisma.memory.count({ where: { workspaceId, status: 'approved' } }),
      app.prisma.memory.count({
        where: { workspaceId, status: 'approved', createdAt: { gte: sevenDaysAgo } },
      }),
      app.prisma.memory.groupBy({
        by: ['type'],
        where: { workspaceId, status: 'approved' },
        _count: { _all: true },
      }),
      listPendingForWorkspace(app.redis, workspaceId),
      app.prisma.agentRun.count({ where: { workspaceId } }),
      app.prisma.agentRun.count({ where: { workspaceId, createdAt: { gte: sevenDaysAgo } } }),
      app.prisma.artifact.aggregate({
        where: { workspaceId },
        _sum: { sizeBytes: true },
      }),
      app.prisma.artifact.count({ where: { workspaceId } }),
    ]);

    const byType = {
      decision: 0,
      bug: 0,
      arch: 0,
      note: 0,
    } as Record<string, number>;
    for (const row of byTypeRaw) {
      byType[row.type] = row._count._all;
    }

    return {
      success: true,
      data: {
        totalMemories,
        memoriesThisWeek,
        pendingCount: pendingItems.length,
        agentRunsTotal,
        agentRunsThisWeek,
        walrusStorageBytes: artifactsSize._sum.sizeBytes ?? 0,
        artifactsCount,
        byType,
      },
    };
  });

  // GET /activity?workspaceId=xxx&limit=20 — recent activity feed
  app.get('/activity', async (req) => {
    const { workspaceId, limit = '20' } = req.query as { workspaceId?: string; limit?: string };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const take = Math.min(Number(limit), 100);

    const [memories, agentRuns, members] = await Promise.all([
      app.prisma.memory.findMany({
        where: { workspaceId, status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take,
        include: { author: { select: { displayName: true, suiAddress: true } } },
      }),
      app.prisma.agentRun.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take,
      }),
      app.prisma.workspaceMember.findMany({
        where: { workspaceId },
        orderBy: { joinedAt: 'desc' },
        take,
        include: { user: { select: { displayName: true, suiAddress: true } } },
      }),
    ]);

    const events = [
      ...memories.map((m) => ({
        type: 'memory_saved' as const,
        id: m.id,
        text: `Memory saved via ${m.source ?? 'MCP'}`,
        sub: `${m.type}: ${m.content.slice(0, 80)}${m.content.length > 80 ? '…' : ''}`,
        actor: m.author.displayName ?? m.author.suiAddress.slice(0, 10),
        timestamp: m.createdAt,
      })),
      ...agentRuns.map((r) => ({
        type: 'agent_run' as const,
        id: r.id,
        text: `${r.agentName} ${r.prNumber ? `reviewed #${r.prNumber}` : 'ran'}`,
        sub: r.memoriesQueried.length > 0
          ? `Referenced ${r.memoriesQueried.length} memories`
          : r.prTitle ?? '',
        actor: r.agentName,
        timestamp: r.createdAt,
      })),
      ...members.map((m) => ({
        type: 'member_joined' as const,
        id: `${m.workspaceId}-${m.userId}`,
        text: `${m.user.displayName ?? m.user.suiAddress.slice(0, 10)} joined workspace`,
        sub: `Sui address ${m.user.suiAddress.slice(0, 10)}…`,
        actor: m.user.displayName ?? m.user.suiAddress,
        timestamp: m.joinedAt,
      })),
    ];

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      success: true,
      data: events.slice(0, take),
    };
  });
}
