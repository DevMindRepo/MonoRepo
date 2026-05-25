import type { FastifyInstance } from 'fastify';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { extractDecisions } from '../../services/llm.js';
import { enqueuePending } from '../../services/pending-queue.js';
import { getEnv } from '../../lib/env.js';
import { BadRequestError, UnauthorizedError } from '../../lib/errors.js';

function verifySignature(secret: string, payload: string, signature: string): boolean {
  if (!signature.startsWith('sha256=')) return false;
  const provided = signature.slice('sha256='.length);
  const expected = createHmac('sha256', secret).update(payload).digest('hex');

  const a = Buffer.from(provided, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const githubEventSchema = z.object({
  workspaceId: z.string(),
  rawText: z.string(),
  authorAddress: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

export default async function githubWebhookRoutes(app: FastifyInstance) {
  // GitHub raw webhook — relies on installed app
  app.post('/webhook/github', { config: { rawBody: true } }, async (req, reply) => {
    const env = getEnv();
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    if (!signature) throw new UnauthorizedError('Missing signature');

    const raw = (req as { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    const payload = req.body as Record<string, unknown>;
    const repository = payload.repository as { full_name?: string } | undefined;
    const repoFullName = repository?.full_name;
    const event = req.headers['x-github-event'] as string | undefined;

    // Try per-workspace webhook config first; fall back to global env secret
    let matchedWebhookId: string | null = null;
    let verified = false;

    if (repoFullName && event) {
      const candidates = await app.prisma.gitHubWebhook.findMany({
        where: { repo: repoFullName, event, active: true },
      });
      for (const wh of candidates) {
        if (verifySignature(wh.secret, raw, signature)) {
          verified = true;
          matchedWebhookId = wh.id;
          break;
        }
      }
    }

    if (!verified) {
      if (!env.GITHUB_WEBHOOK_SECRET) {
        throw new UnauthorizedError('Invalid signature');
      }
      if (!verifySignature(env.GITHUB_WEBHOOK_SECRET, raw, signature)) {
        throw new UnauthorizedError('Invalid signature');
      }
    }

    if (matchedWebhookId) {
      await app.prisma.gitHubWebhook.update({
        where: { id: matchedWebhookId },
        data: { lastDeliveryAt: new Date() },
      });
    }

    let rawText = '';
    let authorLogin = 'unknown';

    if (event === 'pull_request') {
      const pr = payload.pull_request as { title?: string; body?: string; user?: { login?: string } };
      rawText = `PR: ${pr.title ?? ''}\n\n${pr.body ?? ''}`;
      authorLogin = pr.user?.login ?? 'unknown';
    } else if (event === 'push') {
      const commits = (payload.commits as { message: string; author: { username?: string } }[]) ?? [];
      rawText = commits.map((c) => c.message).join('\n\n');
      authorLogin = commits[0]?.author.username ?? 'unknown';
    } else if (event === 'issue_comment') {
      const comment = payload.comment as { body?: string; user?: { login?: string } };
      rawText = comment.body ?? '';
      authorLogin = comment.user?.login ?? 'unknown';
    } else {
      return reply.send({ success: true, data: { skipped: true, event } });
    }

    if (!rawText.trim()) {
      return reply.send({ success: true, data: { skipped: true, reason: 'empty' } });
    }

    app.log.info({ event, authorLogin }, 'GitHub webhook received');

    return reply.send({
      success: true,
      data: { event, accepted: true, queuedFor: 'extraction' },
    });
  });

  // Internal endpoint — used by trusted ingestion (e.g. webhook worker)
  // for testing or manual ingestion via authenticated users
  app.post(
    '/webhook/github/ingest',
    { onRequest: [app.authenticate] },
    async (req) => {
      const body = githubEventSchema.parse(req.body);

      const author = await app.prisma.user.findUnique({ where: { suiAddress: body.authorAddress } });
      if (!author) throw new BadRequestError('Author not registered');

      const decisions = await extractDecisions(body.rawText);
      const enqueued = [];

      for (const d of decisions) {
        const item = await enqueuePending(app.redis, {
          workspaceId: body.workspaceId,
          authorId: author.id,
          content: d.content,
          type: d.type,
          privacy: 'team',
          tags: d.tags,
        });
        enqueued.push(item.pendingId);
      }

      return {
        success: true,
        data: { extracted: decisions.length, pendingIds: enqueued },
      };
    },
  );
}
