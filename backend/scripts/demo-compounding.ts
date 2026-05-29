/**
 * Demo: prove memory compounding.
 *
 * 1. Trigger OOM incident #1
 * 2. Wait for pipeline to finish
 * 3. Resolve it with a useful note
 * 4. Trigger OOM incident #2 (slightly different host)
 * 5. Pipeline #2 should now recall resolution from #1 → higher confidence
 *
 * Usage:
 *   pnpm dotenv -e ../.env -- tsx scripts/demo-compounding.ts
 */
const apiBase = process.env.DEVMIND_API_BASE_URL ?? 'http://localhost:3001';
const token = process.env.DEVMIND_API_TOKEN;
const workspaceId = process.env.DEVMIND_WORKSPACE_ID;

if (!token || !workspaceId) {
  console.error('DEVMIND_API_TOKEN and DEVMIND_WORKSPACE_ID required');
  process.exit(1);
}

async function api<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return JSON.parse(text) as T;
}

async function waitForPipeline(incidentId: string, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await api<{ data: { status: string; confidence: number | null; recallSummary: string | null } }>(
      'GET',
      `/incidents/${incidentId}`,
    );
    const { status, confidence, recallSummary } = res.data;
    if (status === 'responding' || status === 'resolved') {
      return { status, confidence, recallSummary };
    }
    if (status === 'failed') throw new Error(`Pipeline failed for ${incidentId}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Timed out waiting for pipeline (${incidentId})`);
}

async function triggerOom(hostname: string) {
  const res = await api<{ data: { incidentId: string } }>('POST', '/incidents', {
    workspaceId,
    type: 'error',
    severity: 'critical',
    service: 'checkout-api',
    hostname,
    message: 'OutOfMemoryError: heap exhausted at image-resize.ts:42',
    stack:
      'OutOfMemoryError: heap exhausted\n  at allocateBuffer (/app/src/image-resize.ts:42:15)\n  at processImage (/app/src/image-resize.ts:128:21)',
  });
  return res.data.incidentId;
}

async function main() {
  console.log('=== DEMO: Memory compounding via DevMind ===\n');

  console.log('[1/4] Triggering OOM incident #1 on vps-prod-1…');
  const id1 = await triggerOom('vps-prod-1');
  console.log(`     Incident: ${id1}`);
  const result1 = await waitForPipeline(id1);
  console.log(`     Pipeline #1: status=${result1.status} confidence=${result1.confidence?.toFixed(2)}`);
  console.log(`     Recall: ${result1.recallSummary}\n`);

  console.log('[2/4] Resolving incident #1 (saves resolution to MemWal)…');
  await api('POST', `/incidents/${id1}/resolve`, {
    resolutionNotes:
      'Fixed by restarting checkout-api pod + bumped --max-old-space-size=4096. Root cause: sharp library leak on large images. Long-term: refactor pakai sharp stream API (ACME-234).',
  });
  console.log(`     Resolution saved to memory (encrypted on Walrus)\n`);

  console.log('[3/4] Waiting 4s for memory to propagate to MemWal index…');
  await new Promise((r) => setTimeout(r, 4000));

  console.log('\n[4/4] Triggering OOM incident #2 on vps-prod-2 (same error pattern)…');
  const id2 = await triggerOom('vps-prod-2');
  console.log(`     Incident: ${id2}`);
  const result2 = await waitForPipeline(id2);
  console.log(`     Pipeline #2: status=${result2.status} confidence=${result2.confidence?.toFixed(2)}`);
  console.log(`     Recall: ${result2.recallSummary}\n`);

  console.log('=== Compare ===');
  console.log(`Incident #1 confidence: ${result1.confidence?.toFixed(2) ?? '?'}`);
  console.log(`Incident #2 confidence: ${result2.confidence?.toFixed(2) ?? '?'}`);
  console.log(`Incident #1 recall:     ${result1.recallSummary}`);
  console.log(`Incident #2 recall:     ${result2.recallSummary}`);
  console.log(`\nView at: http://localhost:3000/incidents`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
