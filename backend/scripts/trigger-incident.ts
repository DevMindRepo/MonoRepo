/**
 * Trigger a fake incident for E2E testing the incident-response pipeline.
 *
 * Usage:
 *   pnpm dotenv -e ../.env -- tsx scripts/trigger-incident.ts
 *
 * Tunes via env:
 *   INCIDENT_KIND = oom | timeout | auth | attack | random (default: oom)
 */
const apiBase = process.env.DEVMIND_API_BASE_URL ?? 'http://localhost:3001';
const token = process.env.DEVMIND_API_TOKEN;
const workspaceId = process.env.DEVMIND_WORKSPACE_ID;

if (!token || !workspaceId) {
  console.error('DEVMIND_API_TOKEN and DEVMIND_WORKSPACE_ID required in env');
  process.exit(1);
}

const SCENARIOS = {
  oom: {
    type: 'error',
    severity: 'critical',
    service: 'checkout-api',
    hostname: 'vps-prod-1',
    message: 'OutOfMemoryError: heap exhausted at image-resize.ts:42',
    stack:
      'OutOfMemoryError: heap exhausted\n  at allocateBuffer (/app/src/image-resize.ts:42:15)\n  at processImage (/app/src/image-resize.ts:128:21)\n  at handleUpload (/app/src/handlers/upload.ts:55:7)',
  },
  timeout: {
    type: 'performance',
    severity: 'high',
    service: 'payment-service',
    hostname: 'vps-prod-2',
    message: 'ETIMEDOUT: stripe.charges.create exceeded 30s deadline',
    stack:
      'TimeoutError: ETIMEDOUT\n  at Timeout._onTimeout (/app/node_modules/stripe/lib/RequestSender.js:201:7)\n  at processTicksAndRejections (node:internal/process/task_queues:96:5)',
  },
  auth: {
    type: 'attack',
    severity: 'high',
    service: 'auth-service',
    hostname: 'vps-prod-1',
    message: 'Suspicious activity: 500 failed JWT verifications from 203.0.113.42 in 60s',
    stack: undefined,
  },
  attack: {
    type: 'attack',
    severity: 'critical',
    service: 'api-gateway',
    hostname: 'vps-prod-3',
    message: 'SQL injection attempt blocked: pattern "OR 1=1" detected in /api/products?q=',
    stack: undefined,
  },
};

const kind = (process.env.INCIDENT_KIND ?? 'oom') as keyof typeof SCENARIOS;
const scenario = SCENARIOS[kind] ?? SCENARIOS.oom;

async function main() {
  const res = await fetch(`${apiBase}/incidents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workspaceId,
      ...scenario,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Failed: ${res.status} ${text}`);
    process.exit(1);
  }
  const data = JSON.parse(text);
  console.log(`✓ Incident triggered: ${data.data.incidentId}`);
  console.log(`  Scenario: ${kind} (${scenario.type}/${scenario.severity})`);
  console.log(`  Watch at: http://localhost:3000/incidents`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
