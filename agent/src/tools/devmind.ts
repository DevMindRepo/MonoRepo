import axios, { AxiosInstance } from 'axios';
import { getEnv } from '../config.js';

export interface MemoryHit {
  id: string;
  content: string;
  type: string;
  privacy: string;
  tags: string[];
  blobId: string | null;
  source: string | null;
  createdAt: string;
  author: { displayName: string | null; suiAddress: string };
  score: number;
}

export interface AgentRunCreated {
  id: string;
  status: string;
}

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (client) return client;
  const env = getEnv();
  client = axios.create({
    baseURL: env.DEVMIND_API_BASE_URL,
    headers: { Authorization: `Bearer ${env.DEVMIND_API_TOKEN}` },
    timeout: 30_000,
  });
  return client;
}

export async function searchMemory(query: string, limit = 5): Promise<MemoryHit[]> {
  const env = getEnv();
  const res = await getClient().post('/memories/search', {
    workspaceId: env.DEVMIND_WORKSPACE_ID,
    query,
    limit,
  });
  return res.data?.data ?? [];
}

export async function startRun(args: { prNumber?: number; prTitle?: string; prUrl?: string }): Promise<AgentRunCreated> {
  const env = getEnv();
  const res = await getClient().post('/agent-runs', {
    workspaceId: env.DEVMIND_WORKSPACE_ID,
    agentName: 'pr-reviewer',
    prNumber: args.prNumber,
    prTitle: args.prTitle,
    prUrl: args.prUrl,
  });
  return res.data.data;
}

export async function completeRun(
  id: string,
  args: {
    status: 'completed' | 'failed';
    reasoning?: string;
    comment?: string;
    memoriesQueried?: string[];
    reviewPosted?: boolean;
    durationMs?: number;
    errorMessage?: string;
  },
): Promise<void> {
  await getClient().patch(`/agent-runs/${id}`, args);
}
