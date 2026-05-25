import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { ForbiddenError, NotFoundError, ConflictError } from '../lib/errors.js';

const createWebhookSchema = z.object({
  repo: z.string().min(1).max(255).regex(/^[\w.-]+\/[\w.-]+$/, 'repo must be "owner/name"'),
  event: z.enum(['pull_request', 'push', 'issue_comment']).default('pull_request'),
});

async function assertOwner(app: FastifyInstance, workspaceId: string, userId: string) {
  const workspace = await app.prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new NotFoundError('Workspace');
  if (workspace.ownerId !== userId) throw new ForbiddenError('Only owner can manage webhooks');
  return workspace;
}

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

export default async function webhookRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // List webhooks for workspace
  app.get('/workspaces/:id/webhooks', async (req) => {
    const { id } = req.params as { id: string };
    await assertMember(app, id, req.user.userId);

    const webhooks = await app.prisma.gitHubWebhook.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: webhooks.map((w) => ({
        id: w.id,
        repo: w.repo,
        event: w.event,
        active: w.active,
        lastDeliveryAt: w.lastDeliveryAt,
        createdAt: w.createdAt,
      })),
    };
  });

  // Create webhook config — returns the secret ONCE
  app.post('/workspaces/:id/webhooks', async (req) => {
    const { id } = req.params as { id: string };
    const body = createWebhookSchema.parse(req.body);
    await assertOwner(app, id, req.user.userId);

    const existing = await app.prisma.gitHubWebhook.findUnique({
      where: { workspaceId_repo_event: { workspaceId: id, repo: body.repo, event: body.event } },
    });
    if (existing) throw new ConflictError('Webhook for this repo+event already exists');

    const secret = randomBytes(24).toString('hex');

    const webhook = await app.prisma.gitHubWebhook.create({
      data: {
        workspaceId: id,
        repo: body.repo,
        event: body.event,
        secret,
      },
    });

    return {
      success: true,
      data: {
        id: webhook.id,
        repo: webhook.repo,
        event: webhook.event,
        secret,
        active: webhook.active,
        createdAt: webhook.createdAt,
        message: 'Add this secret to your GitHub webhook config. It will not be shown again.',
      },
    };
  });

  // Delete webhook
  app.delete('/workspaces/:id/webhooks/:webhookId', async (req) => {
    const { id, webhookId } = req.params as { id: string; webhookId: string };
    await assertOwner(app, id, req.user.userId);

    const webhook = await app.prisma.gitHubWebhook.findUnique({ where: { id: webhookId } });
    if (!webhook || webhook.workspaceId !== id) throw new NotFoundError('Webhook');

    await app.prisma.gitHubWebhook.delete({ where: { id: webhookId } });
    return { success: true, data: { id: webhookId, deleted: true } };
  });

  // Toggle active
  app.patch('/workspaces/:id/webhooks/:webhookId', async (req) => {
    const { id, webhookId } = req.params as { id: string; webhookId: string };
    const body = z.object({ active: z.boolean() }).parse(req.body);
    await assertOwner(app, id, req.user.userId);

    const webhook = await app.prisma.gitHubWebhook.findUnique({ where: { id: webhookId } });
    if (!webhook || webhook.workspaceId !== id) throw new NotFoundError('Webhook');

    const updated = await app.prisma.gitHubWebhook.update({
      where: { id: webhookId },
      data: { active: body.active },
    });
    return { success: true, data: { id: updated.id, active: updated.active } };
  });
}
