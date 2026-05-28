import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { uploadToWalrus, downloadFromWalrus } from '../services/walrus.js';
import { ForbiddenError, NotFoundError, BadRequestError } from '../lib/errors.js';

const saveArtifactSchema = z.object({
  workspaceId: z.string(),
  filename: z.string().min(1).max(255),
  contentBase64: z.string().min(1),
  type: z.enum(['dataset', 'log', 'report', 'output']),
  source: z.string().optional(),
  relatedMemoryId: z.string().optional(),
});

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

export default async function artifactRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // Upload artifact to Walrus
  app.post('/artifacts', async (req) => {
    const body = saveArtifactSchema.parse(req.body);
    await assertMember(app, body.workspaceId, req.user.userId);

    const data = Buffer.from(body.contentBase64, 'base64');
    const blobId = await uploadToWalrus(new Uint8Array(data));

    const artifact = await app.prisma.artifact.create({
      data: {
        workspaceId: body.workspaceId,
        authorId: req.user.userId,
        filename: body.filename,
        type: body.type,
        memwalMemoryId: blobId, // Walrus blob ID stored in this field for artifacts (raw, not via MemWal)
        sizeBytes: data.length,
        source: body.source ?? null,
        relatedMemoryId: body.relatedMemoryId ?? null,
      },
    });

    return {
      success: true,
      data: {
        artifactId: artifact.id,
        walrusBlobId: blobId,
        sizeBytes: artifact.sizeBytes,
      },
    };
  });

  // List artifacts for a workspace
  app.get('/artifacts', async (req) => {
    const { workspaceId } = req.query as { workspaceId?: string };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const artifacts = await app.prisma.artifact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { author: { select: { id: true, displayName: true, suiAddress: true } } },
    });

    return {
      success: true,
      data: artifacts.map((a) => ({
        id: a.id,
        workspaceId: a.workspaceId,
        filename: a.filename,
        type: a.type,
        blobId: a.memwalMemoryId,
        sizeBytes: a.sizeBytes,
        source: a.source,
        relatedMemoryId: a.relatedMemoryId,
        author: a.author,
        createdAt: a.createdAt,
      })),
    };
  });

  // Download artifact content (returns base64)
  app.get('/artifacts/:id', async (req) => {
    const { id } = req.params as { id: string };
    const artifact = await app.prisma.artifact.findUnique({ where: { id } });
    if (!artifact) throw new NotFoundError('Artifact');
    await assertMember(app, artifact.workspaceId, req.user.userId);

    const data = await downloadFromWalrus(artifact.memwalMemoryId);
    return {
      success: true,
      data: {
        artifactId: artifact.id,
        filename: artifact.filename,
        type: artifact.type,
        sizeBytes: artifact.sizeBytes,
        contentBase64: Buffer.from(data).toString('base64'),
      },
    };
  });
}
