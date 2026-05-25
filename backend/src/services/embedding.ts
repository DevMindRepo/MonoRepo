import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEnv } from '../lib/env.js';

let cached: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (cached) return cached;
  const env = getEnv();
  cached = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return cached;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();
  const env = getEnv();
  const model = client.getGenerativeModel({ model: env.GEMINI_EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' },
    outputDimensionality: env.GEMINI_EMBEDDING_DIM,
  });
  return result.embedding.values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getClient();
  const env = getEnv();
  const model = client.getGenerativeModel({ model: env.GEMINI_EMBEDDING_MODEL });
  const result = await model.batchEmbedContents({
    requests: texts.map((t) => ({
      content: { parts: [{ text: t }], role: 'user' },
      outputDimensionality: env.GEMINI_EMBEDDING_DIM,
    })),
  });
  return result.embeddings.map((e) => e.values);
}
