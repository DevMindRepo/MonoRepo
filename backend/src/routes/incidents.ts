import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ForbiddenError, NotFoundError, BadRequestError } from '../lib/errors.js';
import { rememberMemory } from '../services/memwal.js';

const createIncidentSchema = z.object({
  workspaceId: z.string(),
  type: z.enum(['error', 'attack', 'performance', 'custom']).default('error'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  service: z.string().optional(),
  hostname: z.string().optional(),
  message: z.string().min(1),
  stack: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateIncidentSchema = z.object({
  status: z.enum(['new', 'triaging', 'researching', 'responding', 'resolved', 'failed']).optional(),
  triageNotes: z.string().optional(),
  classification: z.string().optional(),
  researcherNotes: z.string().optional(),
  recallSummary: z.string().optional(),
  responderFix: z.string().optional(),
  suggestedActions: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

const resolveSchema = z.object({
  resolutionNotes: z.string().min(1),
});

async function assertMember(app: FastifyInstance, workspaceId: string, userId: string) {
  const membership = await app.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
}

const INCIDENT_QUEUE_KEY = 'incident:queue';

export default async function incidentRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  // Create incident (called by devmind-monitor SDK on user's server)
  app.post('/incidents', async (req) => {
    const body = createIncidentSchema.parse(req.body);
    await assertMember(app, body.workspaceId, req.user.userId);

    const incident = await app.prisma.incident.create({
      data: {
        workspaceId: body.workspaceId,
        type: body.type,
        severity: body.severity,
        service: body.service ?? null,
        hostname: body.hostname ?? null,
        message: body.message,
        stack: body.stack ?? null,
        metadata: (body.metadata ?? null) as never,
        status: 'new',
        suggestedActions: [],
      },
    });

    // Enqueue for agent pipeline processing
    await app.redis.lpush(INCIDENT_QUEUE_KEY, incident.id);

    return {
      success: true,
      data: { incidentId: incident.id, status: incident.status },
    };
  });

  // List incidents in workspace
  app.get('/incidents', async (req) => {
    const { workspaceId, limit = '50', status } = req.query as {
      workspaceId?: string;
      limit?: string;
      status?: string;
    };
    if (!workspaceId) throw new BadRequestError('workspaceId required');
    await assertMember(app, workspaceId, req.user.userId);

    const incidents = await app.prisma.incident.findMany({
      where: {
        workspaceId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 200),
    });

    return {
      success: true,
      data: incidents.map((i) => ({
        id: i.id,
        workspaceId: i.workspaceId,
        type: i.type,
        severity: i.severity,
        status: i.status,
        service: i.service,
        hostname: i.hostname,
        message: i.message,
        stack: i.stack,
        metadata: i.metadata,
        triageNotes: i.triageNotes,
        classification: i.classification,
        researcherNotes: i.researcherNotes,
        recallSummary: i.recallSummary,
        responderFix: i.responderFix,
        suggestedActions: i.suggestedActions,
        confidence: i.confidence,
        resolutionNotes: i.resolutionNotes,
        resolvedAt: i.resolvedAt,
        resolvedBy: i.resolvedBy,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    };
  });

  // Get single incident with agent runs
  app.get('/incidents/:id', async (req) => {
    const { id } = req.params as { id: string };
    const incident = await app.prisma.incident.findUnique({
      where: { id },
      include: {
        agentRuns: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!incident) throw new NotFoundError('Incident');
    await assertMember(app, incident.workspaceId, req.user.userId);

    return { success: true, data: incident };
  });

  // Update incident (called by agent worker as pipeline progresses)
  app.patch('/incidents/:id', async (req) => {
    const { id } = req.params as { id: string };
    const body = updateIncidentSchema.parse(req.body);

    const existing = await app.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Incident');
    await assertMember(app, existing.workspaceId, req.user.userId);

    const updated = await app.prisma.incident.update({
      where: { id },
      data: body,
    });
    return { success: true, data: updated };
  });

  // Resolve incident — saves resolution as a memory for future recall
  app.post('/incidents/:id/resolve', async (req) => {
    const { id } = req.params as { id: string };
    const body = resolveSchema.parse(req.body);

    const existing = await app.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Incident');
    await assertMember(app, existing.workspaceId, req.user.userId);

    const resolved = await app.prisma.incident.update({
      where: { id },
      data: {
        status: 'resolved',
        resolutionNotes: body.resolutionNotes,
        resolvedAt: new Date(),
        resolvedBy: req.user.userId,
      },
    });

    // Save resolution as a memory so future similar incidents can recall it.
    // Best-effort: don't block the response if memwal fails.
    try {
      const workspace = await app.prisma.workspace.findUnique({
        where: { id: existing.workspaceId },
        select: { memwalNamespace: true },
      });
      if (workspace?.memwalNamespace) {
        const resolutionMemoryContent =
          `[Incident Resolution] ${existing.classification ?? existing.type} on ${existing.service ?? 'service'} ` +
          `(severity ${existing.severity}): "${existing.message.slice(0, 200)}". ` +
          `Resolution: ${body.resolutionNotes}`;

        const { memwalMemoryId } = await rememberMemory({
          namespace: workspace.memwalNamespace,
          content: resolutionMemoryContent,
        });

        await app.prisma.memory.create({
          data: {
            workspaceId: existing.workspaceId,
            authorId: req.user.userId,
            content: resolutionMemoryContent,
            type: existing.type === 'attack' ? 'bug' : 'bug',
            privacy: 'team',
            status: 'approved',
            tags: ['incident-resolution', existing.classification ?? 'unknown', existing.service ?? 'unknown'].filter(Boolean),
            memwalMemoryId,
            source: `incident:${existing.id}`,
          },
        });
      }
    } catch (err) {
      app.log.error({ err, incidentId: id }, 'Failed to save resolution as memory');
    }

    return { success: true, data: resolved };
  });

  // Re-enqueue an incident (manual retry)
  app.post('/incidents/:id/retry', async (req) => {
    const { id } = req.params as { id: string };
    const existing = await app.prisma.incident.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Incident');
    await assertMember(app, existing.workspaceId, req.user.userId);

    await app.prisma.incident.update({
      where: { id },
      data: { status: 'new' },
    });
    await app.redis.lpush(INCIDENT_QUEUE_KEY, id);

    return { success: true, data: { id, status: 'new' } };
  });
}
