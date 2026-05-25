import type Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { detectSecrets } from '@devmind/shared';
import type { MemoryType, MemoryPrivacy, PendingMemory } from '@devmind/shared';
import { getEnv } from '../lib/env.js';

const KEY_PREFIX = 'pending:memory:';
const WORKSPACE_INDEX_PREFIX = 'pending:workspace:';

export interface EnqueueParams {
  workspaceId: string;
  authorId: string;
  content: string;
  type: MemoryType;
  privacy: MemoryPrivacy;
  tags: string[];
  source?: string;
  sessionId?: string;
}

export async function enqueuePending(redis: Redis, params: EnqueueParams): Promise<PendingMemory> {
  const env = getEnv();
  const pendingId = randomUUID();
  const now = Date.now();
  const ttlMs = env.PENDING_TTL_SECONDS * 1000;

  const item: PendingMemory = {
    pendingId,
    workspaceId: params.workspaceId,
    authorId: params.authorId,
    content: params.content,
    type: params.type,
    privacy: params.privacy,
    tags: params.tags,
    secretFlags: detectSecrets(params.content),
    source: params.source,
    sessionId: params.sessionId,
    createdAt: now,
    expiresAt: now + ttlMs,
  };

  const key = KEY_PREFIX + pendingId;
  const indexKey = WORKSPACE_INDEX_PREFIX + params.workspaceId;

  await redis
    .multi()
    .set(key, JSON.stringify(item), 'EX', env.PENDING_TTL_SECONDS)
    .zadd(indexKey, now, pendingId)
    .expire(indexKey, env.PENDING_TTL_SECONDS)
    .exec();

  return item;
}

export async function getPending(redis: Redis, pendingId: string): Promise<PendingMemory | null> {
  const raw = await redis.get(KEY_PREFIX + pendingId);
  if (!raw) return null;
  return JSON.parse(raw) as PendingMemory;
}

export async function listPendingForWorkspace(
  redis: Redis,
  workspaceId: string,
  limit = 50,
): Promise<PendingMemory[]> {
  const indexKey = WORKSPACE_INDEX_PREFIX + workspaceId;
  const ids = await redis.zrevrange(indexKey, 0, limit - 1);
  if (ids.length === 0) return [];

  const keys = ids.map((id) => KEY_PREFIX + id);
  const raws = await redis.mget(...keys);
  return raws
    .filter((r): r is string => r !== null)
    .map((r) => JSON.parse(r) as PendingMemory);
}

export async function deletePending(redis: Redis, pendingId: string, workspaceId: string): Promise<void> {
  await redis
    .multi()
    .del(KEY_PREFIX + pendingId)
    .zrem(WORKSPACE_INDEX_PREFIX + workspaceId, pendingId)
    .exec();
}
