/**
 * Seed dummy memories into a workspace, then approve them.
 * Useful for demo polish (so dashboard + agent searches have context).
 *
 * Usage:
 *   pnpm dotenv -e ../.env -- tsx scripts/seed-memories.ts
 *
 * Env required:
 *   DEVMIND_API_TOKEN, DEVMIND_WORKSPACE_ID, DEVMIND_API_BASE_URL (default http://localhost:3001)
 */

const apiBase = process.env.DEVMIND_API_BASE_URL ?? 'http://localhost:3001';
const token = process.env.DEVMIND_API_TOKEN;
const workspaceId = process.env.DEVMIND_WORKSPACE_ID;

if (!token || !workspaceId) {
  console.error('DEVMIND_API_TOKEN and DEVMIND_WORKSPACE_ID required in env');
  process.exit(1);
}

interface SeedMemory {
  content: string;
  type: 'decision' | 'bug' | 'arch' | 'note';
  tags: string[];
}

const SEEDS: SeedMemory[] = [
  {
    type: 'decision',
    tags: ['database', 'vector-search'],
    content:
      'We use pgvector with 768-dimensional embeddings (Gemini gemini-embedding-001 with forced outputDimensionality=768) instead of OpenAI ada-002. Reason: Gemini has a free tier and matches our Supabase schema.',
  },
  {
    type: 'arch',
    tags: ['auth', 'security'],
    content:
      'API authentication is dual-mode: either a JWT (7-day expiry, issued after Sui wallet signPersonalMessage) OR a long-lived dm_sk_* API token (SHA-256 hashed in DB, sent as Bearer in Authorization). MCP server and PR Reviewer Agent use dm_sk_* tokens.',
  },
  {
    type: 'arch',
    tags: ['storage', 'walrus', 'seal'],
    content:
      'Memory content is encrypted via @mysten/seal (Seal Minimal: hex-string ID, decryption proxy on the backend using a master Sui wallet) before being uploaded to Walrus testnet. Plaintext is never stored in the DB; only the walrusBlobId.',
  },
  {
    type: 'decision',
    tags: ['supabase', 'prisma'],
    content:
      'Always use `prisma db push` (NOT `prisma migrate dev`) against Supabase. Supabase auto-installs extensions like supabase_vault that cause Prisma migrate to detect schema drift and fail.',
  },
  {
    type: 'bug',
    tags: ['seal-sdk'],
    content:
      'Seal SDK 1.1.3 removed `getAllowlistedKeyServers`. We hardcode testnet key server IDs in packages/seal-client/src/seal-client.ts. Encrypt `id` must be a hex string, NOT Uint8Array (silent failure if you pass Uint8Array).',
  },
  {
    type: 'note',
    tags: ['frontend', 'nextjs', 'tailwind'],
    content:
      'Frontend uses Next.js 16.2.6 + React 19.2 + Tailwind 4 — APIs differ significantly from training data. Tailwind 4 has no `tailwind.config.js` (CSS-based config via @theme). Read node_modules/next/dist/docs/ before writing Next-specific code.',
  },
  {
    type: 'arch',
    tags: ['mcp', 'pending-queue'],
    content:
      'MCP save_memory does NOT block: it pushes to a Redis pending queue (24h TTL) and returns immediately with a pending_id. Users approve via the /approval-queue dashboard, which triggers Seal encryption + Walrus upload + Gemini embedding + pgvector insert.',
  },
];

async function api<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
  }
  return parsed as T;
}

async function main() {
  console.log(`Seeding ${SEEDS.length} memories into workspace ${workspaceId}…\n`);

  for (let i = 0; i < SEEDS.length; i++) {
    const seed = SEEDS[i];
    const label = `[${i + 1}/${SEEDS.length}] ${seed.type}/${seed.tags.join(',')}`;

    try {
      console.log(`${label} → saving…`);
      const saveRes = await api<{ success: boolean; data: { pendingId?: string; id?: string } }>(
        'POST',
        '/memories',
        {
          workspaceId,
          content: seed.content,
          type: seed.type,
          privacy: 'team',
          tags: seed.tags,
          source: 'seed-script',
        },
      );

      const pendingId = saveRes.data.pendingId ?? saveRes.data.id;
      if (!pendingId) {
        console.error(`${label} ✗ no pendingId returned`, saveRes);
        continue;
      }

      console.log(`${label} → approving (encrypt + Walrus upload + embed)…`);
      await api('POST', `/pending/${pendingId}/approve`, {});
      console.log(`${label} ✓ done\n`);
    } catch (err) {
      console.error(`${label} ✗ ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }

  console.log('Seed complete. Check http://localhost:3000/memories');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
