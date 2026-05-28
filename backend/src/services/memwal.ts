/**
 * MemWal service — thin wrapper around @mysten-incubation/memwal SDK.
 *
 * MemWal handles: Walrus storage + Seal encryption + vector embedding + indexer.
 * Each DevMind workspace maps to one MemWal namespace.
 *
 * Field semantics (from MemWal SDK types):
 *  - RememberResult.id        → stable server job_id, vector row id
 *  - RememberResult.blob_id   → Walrus blob ID (encrypted memory ciphertext)
 *  - RecallMemory.blob_id     → matches RememberResult.blob_id (link between remember/recall)
 *  - RecallMemory.distance    → cosine distance (lower = more similar)
 *
 * We store `blob_id` as our `memwalMemoryId` because it's the stable cross-call ID
 * that also serves as the public Walrus blob reference for the dashboard.
 */
import { MemWal } from '@mysten-incubation/memwal';
import { getEnv } from '../lib/env.js';

export interface RememberOptions {
  namespace: string;
  content: string;
}

export interface RememberResult {
  memwalMemoryId: string; // = MemWal blob_id (also the Walrus blob ID)
  jobId: string;
}

export interface RecallHit {
  memwalMemoryId: string; // = MemWal blob_id
  content: string;
  score: number; // = 1 - distance (higher = more similar)
}

const clientCache = new Map<string, MemWal>();

function getClient(namespace: string): MemWal {
  const cached = clientCache.get(namespace);
  if (cached) return cached;

  const env = getEnv();
  const client = MemWal.create({
    key: env.MEMWAL_DELEGATE_KEY,
    accountId: env.MEMWAL_ACCOUNT_ID,
    serverUrl: env.MEMWAL_RELAYER_URL,
    namespace,
  });

  clientCache.set(namespace, client);
  return client;
}

export async function rememberMemory(opts: RememberOptions): Promise<RememberResult> {
  const client = getClient(opts.namespace);
  const result = await client.rememberAndWait(opts.content);
  return {
    memwalMemoryId: result.blob_id,
    jobId: result.id,
  };
}

export async function recallMemory(
  namespace: string,
  query: string,
  limit = 5,
): Promise<RecallHit[]> {
  const client = getClient(namespace);
  const result = await client.recall(query, { limit });
  return (result.results ?? []).map((r) => ({
    memwalMemoryId: r.blob_id,
    content: r.text,
    score: 1 - r.distance,
  }));
}

export async function restoreNamespace(namespace: string): Promise<number> {
  const client = getClient(namespace);
  const result = await client.restore(namespace);
  return result.restored;
}

export async function memwalHealth(): Promise<boolean> {
  try {
    const env = getEnv();
    const client = MemWal.create({
      key: env.MEMWAL_DELEGATE_KEY,
      accountId: env.MEMWAL_ACCOUNT_ID,
      serverUrl: env.MEMWAL_RELAYER_URL,
      namespace: 'health-check',
    });
    const health = await client.health();
    return !!health.status;
  } catch {
    return false;
  }
}
