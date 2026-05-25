import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { getPending, listPendingForWorkspace, deletePending } from '../services/pending-queue.js';
import { generateEmbedding } from '../services/embedding.js';
import { encryptForStorage } from '../services/seal.js';
import { uploadToWalrus } from '../services/walrus.js';
import { ForbiddenError, NotFoundError, BadRequestError } from '../lib/errors.js';

const approveSchema = z.object({
  editedContent: z.string().optional(),
  editedTags: z.array(z.string()).optional(),
});

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

export default async function pendingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // List pending memories for a workspace
  app.get('/pending', async (req) => {
    const { workspaceId } = req.query as { workspaceId?: string };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const items = await listPendingForWorkspace(app.redis, workspaceId);

    const authorIds = [...new Set(items.map((i) => i.authorId))];
    const authors = authorIds.length
      ? await app.prisma.user.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, displayName: true, suiAddress: true },
        })
      : [];
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    const workspace = await app.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    return {
      success: true,
      data: items.map((i) => ({
        id: i.pendingId,
        content: i.content,
        type: i.type,
        privacy: i.privacy,
        tags: i.tags,
        source: i.source ?? 'MCP',
        sessionId: i.sessionId,
        workspaceId: i.workspaceId,
        workspaceName: workspace?.name,
        secrets: i.secretFlags.map((pattern) => ({ pattern, index: 0, length: 0 })),
        author: authorMap.get(i.authorId) ?? null,
        createdAt: new Date(i.createdAt).toISOString(),
        expiresAt: new Date(i.expiresAt).toISOString(),
      })),
    };
  });

  // Approve pending → encrypt → upload Walrus → save Memory + Embedding
  app.post('/pending/:id/approve', async (req) => {
    const { id } = req.params as { id: string };
    const body = approveSchema.parse(req.body ?? {});

    const item = await getPending(app.redis, id);
    if (!item) throw new NotFoundError('Pending memory');
    await assertMember(app, item.workspaceId, req.user.userId);

    const finalContent = body.editedContent ?? item.content;
    const finalTags = body.editedTags ?? item.tags;

    const encrypted = await encryptForStorage(finalContent, id);
    const blobId = await uploadToWalrus(encrypted);

    const memory = await app.prisma.memory.create({
      data: {
        workspaceId: item.workspaceId,
        authorId: item.authorId,
        content: finalContent,
        type: item.type,
        privacy: item.privacy,
        status: 'approved',
        tags: finalTags,
        walrusBlobId: blobId,
        source: item.source ?? null,
        sessionId: item.sessionId ?? null,
      },
    });

    const embedding = await generateEmbedding(finalContent);
    const vectorLit = `[${embedding.join(',')}]`;

    await app.prisma.$executeRawUnsafe(
      `INSERT INTO "MemoryEmbedding" ("id", "memoryId", "vector")
       VALUES ($1, $2, $3::vector)`,
      randomUUID(),
      memory.id,
      vectorLit,
    );

    await deletePending(app.redis, id, item.workspaceId);

    return {
      success: true,
      data: { id: memory.id, walrusBlobId: blobId, status: 'approved' },
    };
  });

  // Reject pending → just delete from queue
  app.post('/pending/:id/reject', async (req) => {
    const { id } = req.params as { id: string };
    const item = await getPending(app.redis, id);
    if (!item) throw new NotFoundError('Pending memory');
    await assertMember(app, item.workspaceId, req.user.userId);

    await deletePending(app.redis, id, item.workspaceId);
    return { success: true, data: { id, status: 'rejected' } };
  });
}
