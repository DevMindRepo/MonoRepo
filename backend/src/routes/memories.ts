import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { enqueuePending } from '../services/pending-queue.js';
import { generateEmbedding } from '../services/embedding.js';
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

  // Semantic search in approved memories
  app.post('/memories/search', async (req) => {
    const body = searchSchema.parse(req.body);
    await assertMember(app, body.workspaceId, req.user.userId);

    const embedding = await generateEmbedding(body.query);
    const vectorLit = `[${embedding.join(',')}]`;

    type Row = {
      id: string;
      content: string;
      type: string;
      privacy: string;
      tags: string[];
      walrus_blob_id: string | null;
      source: string | null;
      created_at: Date;
      author_id: string;
      author_display_name: string | null;
      author_sui_address: string;
      score: number;
    };

    const rows = await app.prisma.$queryRawUnsafe<Row[]>(
      `SELECT m.id, m.content, m.type, m.privacy, m.tags,
              m."walrusBlobId" as walrus_blob_id, m.source,
              m."createdAt" as created_at,
              m."authorId" as author_id,
              u."displayName" as author_display_name,
              u."suiAddress" as author_sui_address,
              1 - (e.vector <=> $1::vector) as score
         FROM "Memory" m
         JOIN "MemoryEmbedding" e ON e."memoryId" = m.id
         JOIN "User" u ON u.id = m."authorId"
        WHERE m."workspaceId" = $2 AND m.status = 'approved'
        ORDER BY e.vector <=> $1::vector
        LIMIT $3`,
      vectorLit,
      body.workspaceId,
      body.limit,
    );

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        content: r.content,
        type: r.type,
        privacy: r.privacy,
        tags: r.tags,
        blobId: r.walrus_blob_id,
        source: r.source,
        score: r.score,
        author: {
          id: r.author_id,
          displayName: r.author_display_name,
          suiAddress: r.author_sui_address,
        },
        createdAt: r.created_at.toISOString(),
      })),
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
        blobId: m.walrusBlobId,
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
        blobId: memory.walrusBlobId,
        source: memory.source,
        sessionId: memory.sessionId,
        author: memory.author,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      },
    };
  });
}
