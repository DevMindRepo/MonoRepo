# devmind-monitor

> Lightweight production monitoring SDK for [DevMind](https://github.com/DevMindRepo/MonoRepo). Captures errors and forwards them to DevMind agents, which then triage the incident, search your team's memory for prior similar incidents, and propose a fix — autonomously.

Think of it as **Sentry + an autonomous incident-response engineer that remembers everything your team ever learned**.

## Install

```bash
npm install devmind-monitor
```

## Quick start

```ts
import { DevMindMonitor } from 'devmind-monitor';

const monitor = new DevMindMonitor({
  apiUrl: 'https://api.devmind.app',
  apiToken: process.env.DEVMIND_TOKEN!,
  workspaceId: process.env.DEVMIND_WORKSPACE!,
  service: 'checkout-api',
});

monitor.attachToProcess();
```

That's it. Any uncaught error or unhandled rejection on this process will:

1. Be captured locally (zero overhead — it's just a `process.on` hook)
2. Be forwarded to your DevMind backend
3. Trigger a 3-agent pipeline (Triage → Researcher → Responder)
4. Show up in your DevMind dashboard at `/incidents` with a suggested fix within ~30 seconds

## Manual reporting

For app-level events (caught errors, business-logic alerts, etc):

```ts
await monitor.reportIncident({
  type: 'error',
  severity: 'critical',
  message: 'Payment service unreachable',
  metadata: { customerId: '...', orderId: '...' },
});
```

## Config

| Option | Required | Default | Description |
|---|---|---|---|
| `apiUrl` | yes | — | DevMind backend URL |
| `apiToken` | yes | — | `dm_sk_*` token (generate at `/connect`) |
| `workspaceId` | yes | — | Target workspace |
| `service` | no | — | Logical service name (e.g. `"checkout-api"`) |
| `hostname` | no | `os.hostname()` | Instance identifier |
| `verbose` | no | `true` | Console.error on transport failures |
| `redactPatterns` | no | DM tokens, Stripe, JWT, AWS, `password=`, `bearer ...` | Regex patterns redacted before send |
| `defaultSeverity` | no | `critical` | Severity for auto-captured exceptions |

## What gets sent

```ts
POST {apiUrl}/incidents
{
  workspaceId,
  type: 'error' | 'attack' | 'performance' | 'custom',
  severity: 'low' | 'medium' | 'high' | 'critical',
  service: string,
  hostname: string,
  message: string,    // redacted
  stack: string,      // redacted
  metadata: object,
}
```

## Privacy

The SDK redacts common secrets before sending (DevMind tokens, Stripe keys, JWTs, AWS keys, `password=` query params, bearer headers). You can pass your own `redactPatterns` for custom rules.

For full data sovereignty, self-host DevMind backend (`docker compose up` from the monorepo) and point `apiUrl` to your own instance — DevMind team will never see your data.

## License

MIT
