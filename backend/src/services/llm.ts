import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '../lib/env.js';

let cached: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (cached) return cached;
  const env = getEnv();
  cached = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return cached;
}

const EXTRACT_DECISIONS_PROMPT = `You analyze code-related text (commit messages, PR descriptions, issue comments) and extract architectural decisions, bug reports, or notable design choices that a team's AI assistant should remember long-term.

Rules:
- Only extract content that represents a DECISION, ARCHITECTURE choice, BUG context, or NOTE worth recalling later.
- Ignore trivia like dependency bumps, formatting, typos, or routine refactors.
- Each item is 1-3 sentences, action-oriented, written from the team's perspective.
- Output a JSON object: { "items": [{ "content": string, "type": "decision" | "bug" | "arch" | "note", "tags": string[] }] }
- If nothing notable, return { "items": [] }.`;

export interface ExtractedDecision {
  content: string;
  type: 'decision' | 'bug' | 'arch' | 'note';
  tags: string[];
}

export async function extractDecisions(rawText: string): Promise<ExtractedDecision[]> {
  const client = getClient();
  const env = getEnv();

  const model = client.getGenerativeModel({
    model: env.GEMINI_CHAT_MODEL,
    systemInstruction: EXTRACT_DECISIONS_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const result = await model.generateContent(rawText);
  const raw = result.response.text();

  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : (parsed.items ?? []);
    return items.filter((i: unknown): i is ExtractedDecision => {
      return (
        typeof i === 'object' && i !== null &&
        typeof (i as ExtractedDecision).content === 'string' &&
        ['decision', 'bug', 'arch', 'note'].includes((i as ExtractedDecision).type)
      );
    });
  } catch {
    return [];
  }
}
