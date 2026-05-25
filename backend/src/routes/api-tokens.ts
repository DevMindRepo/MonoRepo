import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { generateApiToken } from '../services/api-token.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';

const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  workspaceId: z.string().optional(),
});

export default async function apiTokenRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // List user's tokens (never returns raw token)
  app.get('/api-tokens', async (req) => {
    const tokens = await app.prisma.apiToken.findMany({
      where: { userId: req.user.userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: tokens.map((t) => ({
        id: t.id,
        name: t.name,
        prefix: t.prefix,
        workspaceId: t.workspaceId,
        lastUsedAt: t.lastUsedAt,
        createdAt: t.createdAt,
      })),
    };
  });

  // Create new API token (returns raw token ONCE)
  app.post('/api-tokens', async (req) => {
    const body = createTokenSchema.parse(req.body);

    if (body.workspaceId) {
      const membership = await app.prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: body.workspaceId, userId: req.user.userId } },
      });
      if (!membership) throw new ForbiddenError('Not a workspace member');
    }

    const generated = generateApiToken();

    const token = await app.prisma.apiToken.create({
      data: {
        userId: req.user.userId,
        workspaceId: body.workspaceId ?? null,
        name: body.name,
        tokenHash: generated.hash,
        prefix: generated.prefix,
      },
    });

    return {
      success: true,
      data: {
        id: token.id,
        name: token.name,
        token: generated.raw,
        prefix: generated.prefix,
        workspaceId: token.workspaceId,
        createdAt: token.createdAt,
        message: 'Save this token now — it will not be shown again.',
      },
    };
  });

  // Revoke (soft delete) a token
  app.delete('/api-tokens/:id', async (req) => {
    const { id } = req.params as { id: string };
    const token = await app.prisma.apiToken.findUnique({ where: { id } });
    if (!token) throw new NotFoundError('API token');
    if (token.userId !== req.user.userId) throw new ForbiddenError('Not your token');

    await app.prisma.apiToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return { success: true, data: { id, revoked: true } };
  });
}
