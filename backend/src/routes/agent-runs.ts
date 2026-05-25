import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError } from '../lib/errors.js';

const createRunSchema = z.object({
  workspaceId: z.string(),
  agentName: z.string().default('pr-reviewer'),
  prNumber: z.number().int().positive().optional(),
  prTitle: z.string().optional(),
  prUrl: z.string().url().optional(),
});

const updateRunSchema = z.object({
  status: z.enum(['running', 'completed', 'failed']).optional(),
  reasoning: z.string().optional(),
  comment: z.string().optional(),
  memoriesQueried: z.array(z.string()).optional(),
  reviewPosted: z.boolean().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  errorMessage: z.string().optional(),
});

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

export default async function agentRunRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // List agent runs for a workspace
  app.get('/agent-runs', async (req) => {
    const { workspaceId, limit = '50' } = req.query as { workspaceId?: string; limit?: string };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const runs = await app.prisma.agentRun.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
    });

    return {
      success: true,
      data: runs.map((r) => ({
        id: r.id,
        workspaceId: r.workspaceId,
        agentName: r.agentName,
        prNumber: r.prNumber,
        prTitle: r.prTitle,
        prUrl: r.prUrl,
        status: r.status,
        reasoning: r.reasoning,
        comment: r.comment,
        memoriesQueried: r.memoriesQueried,
        reviewPosted: r.reviewPosted,
        durationMs: r.durationMs,
        errorMessage: r.errorMessage,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    };
  });

  // Get single agent run
  app.get('/agent-runs/:id', async (req) => {
    const { id } = req.params as { id: string };
    const run = await app.prisma.agentRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundError('Agent run');
    await assertMember(app, run.workspaceId, req.user.userId);

    return { success: true, data: run };
  });

  // Create agent run (called by agent before starting)
  app.post('/agent-runs', async (req) => {
    const body = createRunSchema.parse(req.body);
    await assertMember(app, body.workspaceId, req.user.userId);

    const run = await app.prisma.agentRun.create({
      data: {
        workspaceId: body.workspaceId,
        agentName: body.agentName,
        prNumber: body.prNumber ?? null,
        prTitle: body.prTitle ?? null,
        prUrl: body.prUrl ?? null,
        status: 'running',
        memoriesQueried: [],
      },
    });

    return { success: true, data: { id: run.id, status: run.status } };
  });

  // Update agent run (called when agent finishes)
  app.patch('/agent-runs/:id', async (req) => {
    const { id } = req.params as { id: string };
    const body = updateRunSchema.parse(req.body);

    const run = await app.prisma.agentRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundError('Agent run');
    await assertMember(app, run.workspaceId, req.user.userId);

    const isTerminal = body.status === 'completed' || body.status === 'failed';

    const updated = await app.prisma.agentRun.update({
      where: { id },
      data: {
        ...body,
        completedAt: isTerminal ? new Date() : run.completedAt,
      },
    });

    return { success: true, data: updated };
  });
}
