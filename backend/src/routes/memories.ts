import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { enqueuePending } from '../services/pending-queue.js';
import { recallMemory } from '../services/memwal.js';
import { ForbiddenError, NotFoundError, BadRequestError } from '../lib/errors.js';

const saveMemorySchema = z.object({
  workspaceId: z.string(),
  content: z.string().min(1),
  type: z.enum(['decision', 'bug', 'arch', 'note']),
  privacy: z.enum(['private', 'team', 'public']).default('team'),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
  sessionId: z.string().optional(),
});

const searchSchema = z.object({
  workspaceId: z.string(),
  query: z.string().min(1),
  limit: z.coerce.number().min(1).max(20).default(5),
});

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

export default async function memoryRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // Save memory → pending queue (user approves later)
  app.post('/memories', async (req) => {
    const body = saveMemorySchema.parse(req.body);
    await assertMember(app, body.workspaceId, req.user.userId);

    const pending = await enqueuePending(app.redis, {
      workspaceId: body.workspaceId,
      authorId: req.user.userId,
      content: body.content,
      type: body.type,
      privacy: body.privacy,
      tags: body.tags,
      source: body.source,
      sessionId: body.sessionId,
    });

    return {
      success: true,
      data: {
        pendingId: pending.pendingId,
        status: 'pending_approval' as const,
        secretFlags: pending.secretFlags,
      },
    };
  });

  // Semantic search — delegates to MemWal.recall over workspace namespace
  app.post('/memories/search', async (req) => {
    const body = searchSchema.parse(req.body);
    await assertMember(app, body.workspaceId, req.user.userId);

    const workspace = await app.prisma.workspace.findUnique({
      where: { id: body.workspaceId },
      select: { memwalNamespace: true },
    });
    if (!workspace?.memwalNamespace) {
      throw new BadRequestError('Workspace has no MemWal namespace configured');
    }

    const hits = await recallMemory(workspace.memwalNamespace, body.query, body.limit);
    if (hits.length === 0) return { success: true, data: [] };

    // Hydrate hits with our DB metadata (tags, author, type)
    const memwalIds = hits.map((h) => h.memwalMemoryId);
    const memories = await app.prisma.memory.findMany({
      where: { workspaceId: body.workspaceId, memwalMemoryId: { in: memwalIds }, status: 'approved' },
      include: { author: { select: { id: true, displayName: true, suiAddress: true } } },
    });
    const byMemwalId = new Map(memories.map((m) => [m.memwalMemoryId!, m]));

    return {
      success: true,
      data: hits
        .map((h) => {
          const m = byMemwalId.get(h.memwalMemoryId);
          if (!m) return null;
          return {
            id: m.id,
            content: m.content,
            type: m.type,
            privacy: m.privacy,
            tags: m.tags,
            memwalMemoryId: m.memwalMemoryId,
            source: m.source,
            score: h.score,
            author: m.author,
            createdAt: m.createdAt.toISOString(),
          };
        })
        .filter((x) => x !== null),
    };
  });

  // List approved memories in workspace
  app.get('/memories', async (req) => {
    const { workspaceId, limit = '50' } = req.query as { workspaceId?: string; limit?: string };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const memories = await app.prisma.memory.findMany({
      where: { workspaceId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
      include: {
        author: { select: { id: true, displayName: true, suiAddress: true } },
      },
    });

    return {
      success: true,
      data: memories.map((m) => ({
        id: m.id,
        workspaceId: m.workspaceId,
        content: m.content,
        type: m.type,
        privacy: m.privacy,
        status: m.status,
        tags: m.tags,
        memwalMemoryId: m.memwalMemoryId,
        source: m.source,
        sessionId: m.sessionId,
        author: m.author,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    };
  });

  // Get single memory
  app.get('/memories/:id', async (req) => {
    const { id } = req.params as { id: string };
    const memory = await app.prisma.memory.findUnique({
      where: { id },
      include: { author: { select: { id: true, displayName: true, suiAddress: true } } },
    });
    if (!memory) throw new NotFoundError('Memory');
    await assertMember(app, memory.workspaceId, req.user.userId);

    return {
      success: true,
      data: {
        id: memory.id,
        workspaceId: memory.workspaceId,
        content: memory.content,
        type: memory.type,
        privacy: memory.privacy,
        status: memory.status,
        tags: memory.tags,
        memwalMemoryId: memory.memwalMemoryId,
        source: memory.source,
        sessionId: memory.sessionId,
        author: memory.author,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      },
    };
  });
}
