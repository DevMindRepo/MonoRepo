/**
 * Incident worker — long-running consumer for Redis incident queue.
 *
 * Pipeline (each incident):
 *   1. Triage      → classify type + severity, write notes
 *   2. Researcher  → semantic-search workspace memory for prior similar incidents
 *   3. Responder   → Gemini composes suggested fix + actions
 *
 * Each step logs an AgentRun (visible in /agent-timeline) AND updates the
 * Incident row in place (visible in /incidents). When the pipeline finishes
 * the incident is left in status `responding` for the user to review and
 * eventually `resolved`.
 */
import type { FastifyInstance } from 'fastify';
import type { Incident } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { recallMemory, type RecallHit } from '../services/memwal.js';
import { getEnv } from '../lib/env.js';

const INCIDENT_QUEUE_KEY = 'incident:queue';
const POLL_INTERVAL_MS = 2_000;
const BLOCKING_POP_TIMEOUT_S = 5;

let geminiClient: GoogleGenerativeAI | null = null;
function getGemini(): GoogleGenerativeAI {
  if (geminiClient) return geminiClient;
  geminiClient = new GoogleGenerativeAI(getEnv().GEMINI_API_KEY);
  return geminiClient;
}

interface AgentLogger {
  start(agentName: string): Promise<string>;
  complete(
    runId: string,
    args: {
      reasoning?: string;
      comment?: string;
      memoriesQueried?: string[];
      durationMs: number;
      errorMessage?: string;
      failed?: boolean;
    },
  ): Promise<void>;
}

function buildAgentLogger(app: FastifyInstance, incident: Incident): AgentLogger {
  return {
    async start(agentName) {
      const run = await app.prisma.agentRun.create({
        data: {
          workspaceId: incident.workspaceId,
          agentName,
          status: 'running',
          memoriesQueried: [],
          incidentId: incident.id,
        },
      });
      return run.id;
    },
    async complete(runId, args) {
      await app.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: args.failed ? 'failed' : 'completed',
          reasoning: args.reasoning,
          comment: args.comment,
          memoriesQueried: args.memoriesQueried ?? [],
          durationMs: args.durationMs,
          errorMessage: args.errorMessage,
          completedAt: new Date(),
        },
      });
    },
  };
}

/* ─────────── AGENT 1: TRIAGE ─────────── */
async function triageAgent(app: FastifyInstance, incident: Incident, logger: AgentLogger) {
  const start = Date.now();
  const runId = await logger.start('incident-triage');

  try {
    await app.prisma.incident.update({
      where: { id: incident.id },
      data: { status: 'triaging' },
    });

    // Heuristic classification (no LLM needed — fast deterministic step)
    const msg = incident.message.toLowerCase();
    let classification = 'unknown';
    let severity = incident.severity;

    if (/oom|out\s*of\s*memory|heap/.test(msg)) classification = 'memory-exhaustion';
    else if (/timeout|deadline|etimedout/.test(msg)) classification = 'timeout';
    else if (/connection|econnrefused|enotfound/.test(msg)) classification = 'network';
    else if (/permission|unauthor|forbidden|403/.test(msg)) classification = 'auth';
    else if (/syntax|parse|unexpected token/.test(msg)) classification = 'syntax';
    else if (/null|undefined|cannot read prop/.test(msg)) classification = 'null-reference';
    else if (incident.type === 'attack') classification = 'security';
    else if (incident.type === 'performance') classification = 'performance-degradation';
    else classification = 'generic-error';

    // Promote severity if critical patterns present
    if (/critical|fatal|panic|crash/.test(msg) && severity !== 'critical') severity = 'high';

    const triageNotes =
      `Incident classified as **${classification}** with severity **${severity}**.` +
      ` Service: ${incident.service ?? 'unknown'}, host: ${incident.hostname ?? 'unknown'}.` +
      (incident.stack ? ` Stack trace present (${incident.stack.split('\n').length} frames).` : '');

    await app.prisma.incident.update({
      where: { id: incident.id },
      data: { triageNotes, classification, severity },
    });

    await logger.complete(runId, {
      reasoning: triageNotes,
      durationMs: Date.now() - start,
    });

    return { classification, severity, triageNotes };
  } catch (err) {
    await logger.complete(runId, {
      durationMs: Date.now() - start,
      failed: true,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/* ─────────── AGENT 2: RESEARCHER ─────────── */
async function researcherAgent(
  app: FastifyInstance,
  incident: Incident,
  classification: string,
  logger: AgentLogger,
) {
  const start = Date.now();
  const runId = await logger.start('incident-researcher');

  try {
    await app.prisma.incident.update({
      where: { id: incident.id },
      data: { status: 'researching' },
    });

    // Get workspace namespace
    const workspace = await app.prisma.workspace.findUnique({
      where: { id: incident.workspaceId },
      select: { memwalNamespace: true },
    });
    if (!workspace?.memwalNamespace) {
      throw new Error('Workspace has no MemWal namespace');
    }

    // Query memory with multiple search angles
    const queries = [
      `${classification} ${incident.message}`.slice(0, 500),
      incident.service ? `${incident.service} error fix` : '',
      classification,
    ].filter(Boolean);

    const seen = new Set<string>();
    const allHits: RecallHit[] = [];
    for (const q of queries) {
      try {
        const hits = await recallMemory(workspace.memwalNamespace, q, 5);
        for (const h of hits) {
          if (!seen.has(h.memwalMemoryId)) {
            seen.add(h.memwalMemoryId);
            allHits.push(h);
          }
        }
      } catch {
        // Skip query failures
      }
    }

    // Top 5 most relevant
    const top = allHits.sort((a, b) => b.score - a.score).slice(0, 5);

    // Hydrate with DB metadata
    const memIds = top.map((h) => h.memwalMemoryId);
    const memories = memIds.length
      ? await app.prisma.memory.findMany({
          where: { workspaceId: incident.workspaceId, memwalMemoryId: { in: memIds } },
        })
      : [];

    const recallSummary =
      memories.length === 0
        ? 'No prior similar incidents found in workspace memory.'
        : `Found ${memories.length} potentially relevant memory entries (top score ${top[0]?.score.toFixed(2)}).`;

    const researcherNotes = memories
      .map((m, i) => `[${i + 1}] (${m.type}/${m.tags.join(',')}) ${m.content.slice(0, 200)}`)
      .join('\n') || '(no relevant memories)';

    await app.prisma.incident.update({
      where: { id: incident.id },
      data: { recallSummary, researcherNotes },
    });

    await logger.complete(runId, {
      reasoning: recallSummary,
      comment: researcherNotes,
      memoriesQueried: memIds,
      durationMs: Date.now() - start,
    });

    return { memories, hits: top, recallSummary, researcherNotes };
  } catch (err) {
    await logger.complete(runId, {
      durationMs: Date.now() - start,
      failed: true,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/* ─────────── AGENT 3: RESPONDER ─────────── */
const RESPONDER_SYSTEM_PROMPT = `You are an incident response agent inside DevMind, a persistent memory system for engineering teams.

Given:
- A production incident (error/attack/performance issue)
- The team's classification (from triage agent)
- Relevant memories from past decisions, bugs, and incidents

Produce a JSON response with this shape:
{
  "summary": string,           // 1-2 sentence top-line
  "rootCauseHypothesis": string,
  "suggestedActions": string[],  // ordered, immediate to long-term, 2-5 items
  "confidence": number,          // 0..1, how confident in the hypothesis given evidence
  "relatedMemoryIds": string[]   // memory IDs you cited (from input)
}

Rules:
- Be concrete. Reference specific functions / files / commands when possible.
- If memories suggest a known fix, prioritize that action.
- If no memories are relevant, fall back to general engineering best practices.
- Confidence should be high (>0.7) only when memory provides direct evidence.
- "suggestedActions" should be ordered: immediate mitigation first, root-cause fix later.`;

async function responderAgent(
  app: FastifyInstance,
  incident: Incident,
  classification: string,
  memories: { id: string; memwalMemoryId: string | null; content: string; type: string; tags: string[] }[],
  logger: AgentLogger,
) {
  const start = Date.now();
  const runId = await logger.start('incident-responder');

  try {
    await app.prisma.incident.update({
      where: { id: incident.id },
      data: { status: 'responding' },
    });

    const memoryContext = memories.length
      ? memories
          .map(
            (m, idx) =>
              `[${idx + 1}] id=${m.memwalMemoryId ?? m.id} type=${m.type} tags=${m.tags.join(',')}\n   ${m.content.replace(/\n/g, ' ').slice(0, 400)}`,
          )
          .join('\n')
      : '(no relevant memories found)';

    const userPrompt = `# Incident

Type:           ${incident.type}
Severity:       ${incident.severity}
Classification: ${classification}
Service:        ${incident.service ?? 'unknown'}
Hostname:       ${incident.hostname ?? 'unknown'}

## Error
${incident.message}

${incident.stack ? `## Stack trace\n\`\`\`\n${incident.stack.slice(0, 2000)}\n\`\`\`\n` : ''}

## Team Memory
${memoryContext}

Now produce the response JSON.`;

    const env = getEnv();
    const model = getGemini().getGenerativeModel({
      model: env.GEMINI_CHAT_MODEL,
      systemInstruction: RESPONDER_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(userPrompt);
    const raw = result.response.text();

    let parsed: {
      summary?: string;
      rootCauseHypothesis?: string;
      suggestedActions?: string[];
      confidence?: number;
      relatedMemoryIds?: string[];
    } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw.slice(0, 400), suggestedActions: [] };
    }

    const responderFix =
      `## ${parsed.summary ?? 'Suggested response'}\n\n` +
      (parsed.rootCauseHypothesis ? `**Root cause hypothesis**: ${parsed.rootCauseHypothesis}\n\n` : '') +
      `**Confidence**: ${(parsed.confidence ?? 0).toFixed(2)}`;

    const suggestedActions = Array.isArray(parsed.suggestedActions)
      ? parsed.suggestedActions.map(String)
      : [];

    await app.prisma.incident.update({
      where: { id: incident.id },
      data: {
        responderFix,
        suggestedActions,
        confidence: parsed.confidence ?? null,
      },
    });

    await logger.complete(runId, {
      reasoning: parsed.summary ?? 'Composed suggested fix',
      comment: responderFix + '\n\n' + suggestedActions.map((a, i) => `${i + 1}. ${a}`).join('\n'),
      memoriesQueried: parsed.relatedMemoryIds ?? [],
      durationMs: Date.now() - start,
    });

    return { responderFix, suggestedActions, confidence: parsed.confidence };
  } catch (err) {
    await logger.complete(runId, {
      durationMs: Date.now() - start,
      failed: true,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/* ─────────── PIPELINE ORCHESTRATOR ─────────── */
async function processIncident(app: FastifyInstance, incidentId: string) {
  const incident = await app.prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) {
    app.log.warn({ incidentId }, 'Incident not found, skipping');
    return;
  }
  if (incident.status === 'resolved') {
    app.log.info({ incidentId }, 'Incident already resolved, skipping');
    return;
  }

  app.log.info({ incidentId, severity: incident.severity }, 'Processing incident');
  const logger = buildAgentLogger(app, incident);

  try {
    const { classification } = await triageAgent(app, incident, logger);
    const { memories } = await researcherAgent(app, incident, classification, logger);
    await responderAgent(app, incident, classification, memories, logger);

    app.log.info({ incidentId }, 'Incident pipeline complete');
  } catch (err) {
    app.log.error({ incidentId, err }, 'Incident pipeline failed');
    await app.prisma.incident.update({
      where: { id: incidentId },
      data: { status: 'failed' },
    });
  }
}

export async function startIncidentWorker(app: FastifyInstance): Promise<void> {
  app.log.info('Incident worker started');

  // Drain any incidents that were left in the queue across restarts.
  while (true) {
    try {
      // BRPOP blocks until something arrives or timeout. Returns [key, value].
      const popped = await app.redis.brpop(INCIDENT_QUEUE_KEY, BLOCKING_POP_TIMEOUT_S);
      if (popped) {
        const [, incidentId] = popped;
        await processIncident(app, incidentId);
      }
    } catch (err) {
      app.log.error({ err }, 'Incident worker loop error');
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  }
}
