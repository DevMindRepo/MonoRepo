import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '../config.js';
import type { MemoryHit } from './devmind.js';
import type { PrInfo } from './github.js';

let cached: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (cached) return cached;
  cached = new GoogleGenerativeAI(getEnv().GEMINI_API_KEY);
  return cached;
}

const REVIEW_SYSTEM_PROMPT = `You are DevMind PR Reviewer, an AI code reviewer with access to your team's persistent memory of past architectural decisions, bug contexts, and notes.

Your job: review the pull request below against the team's recorded memory. Output a JSON object with this shape:
{
  "verdict": "approve" | "request_changes" | "comment",
  "summary": string,            // 1-2 sentence top-line
  "concerns": string[],         // specific concerns referencing memories or diff lines
  "praise": string[],           // things done well
  "memory_references": string[] // memory IDs cited (from the input)
}

Rules:
- If the PR violates a past decision in memory, flag it concretely (cite memory ID).
- If memory is irrelevant to the PR, focus on plain code-review feedback.
- Keep "summary" under 250 chars.
- "request_changes" only when a recorded decision is clearly violated; otherwise prefer "comment".`;

export interface ReviewResult {
  verdict: 'approve' | 'request_changes' | 'comment';
  summary: string;
  concerns: string[];
  praise: string[];
  memory_references: string[];
}

function truncateDiff(diff: string, maxChars = 8000): string {
  if (diff.length <= maxChars) return diff;
  return diff.slice(0, maxChars) + `\n... (truncated ${diff.length - maxChars} chars)`;
}

export async function reviewPr(pr: PrInfo, memories: MemoryHit[]): Promise<ReviewResult> {
  const env = getEnv();
  const client = getClient();

  const model = client.getGenerativeModel({
    model: env.GEMINI_CHAT_MODEL,
    systemInstruction: REVIEW_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const memoryContext = memories.length
    ? memories
        .map(
          (m, idx) =>
            `[${idx + 1}] id=${m.id} type=${m.type} score=${m.score.toFixed(3)}\n   ${m.content.replace(/\n/g, ' ')}`,
        )
        .join('\n')
    : '(no relevant memories found)';

  const userPrompt = `# PR ${pr.owner}/${pr.repo}#${pr.number}: ${pr.title}
By: ${pr.author}
${pr.baseRef} ← ${pr.headRef}

## PR Description
${pr.body || '(empty)'}

## Changed files (${pr.changedFiles.length})
${pr.changedFiles.slice(0, 30).join('\n')}

## Diff
\`\`\`diff
${truncateDiff(pr.diff)}
\`\`\`

## Team Memory (most relevant first)
${memoryContext}

Now produce the review JSON.`;

  const result = await model.generateContent(userPrompt);
  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);
    return {
      verdict: parsed.verdict ?? 'comment',
      summary: String(parsed.summary ?? 'No summary'),
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns.map(String) : [],
      praise: Array.isArray(parsed.praise) ? parsed.praise.map(String) : [],
      memory_references: Array.isArray(parsed.memory_references) ? parsed.memory_references.map(String) : [],
    };
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}

/**
 * Build a Markdown comment body for posting on GitHub.
 */
export function renderReviewComment(review: ReviewResult, memories: MemoryHit[]): string {
  const verdictEmoji = {
    approve: '✅',
    request_changes: '🛑',
    comment: '💭',
  }[review.verdict];

  const lines: string[] = [
    `## ${verdictEmoji} DevMind PR Review — ${review.verdict.replace('_', ' ')}`,
    '',
    review.summary,
    '',
  ];

  if (review.concerns.length) {
    lines.push('### Concerns');
    review.concerns.forEach((c) => lines.push(`- ${c}`));
    lines.push('');
  }

  if (review.praise.length) {
    lines.push('### Looks good');
    review.praise.forEach((p) => lines.push(`- ${p}`));
    lines.push('');
  }

  if (review.memory_references.length && memories.length) {
    const byId = new Map(memories.map((m) => [m.id, m]));
    lines.push('### Memory referenced');
    review.memory_references.forEach((id) => {
      const mem = byId.get(id);
      if (mem) {
        lines.push(`- \`${id}\` (${mem.type}) — ${mem.content.slice(0, 200)}`);
      }
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('_Reviewed autonomously by [DevMind PR Reviewer](https://github.com/DevMindRepo). Memory persisted on Walrus._');

  return lines.join('\n');
}
