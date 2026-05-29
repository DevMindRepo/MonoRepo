/**
 * devmind-monitor — lightweight production monitoring SDK.
 *
 * Drops into any Node.js app. Captures uncaught errors + unhandled rejections,
 * forwards them to DevMind backend. DevMind agents then triage, search memory,
 * and propose fixes — all on the backend side.
 *
 * @example
 *   import { DevMindMonitor } from 'devmind-monitor';
 *
 *   const monitor = new DevMindMonitor({
 *     apiUrl: 'https://api.devmind.app',
 *     apiToken: process.env.DEVMIND_TOKEN!,
 *     workspaceId: process.env.DEVMIND_WORKSPACE!,
 *     service: 'checkout-api',
 *   });
 *
 *   monitor.attachToProcess();
 *
 *   // Manual report:
 *   await monitor.reportIncident({
 *     type: 'error',
 *     severity: 'critical',
 *     message: 'Payment service unreachable',
 *   });
 */

export type IncidentType = 'error' | 'attack' | 'performance' | 'custom';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DevMindMonitorConfig {
  /** DevMind backend URL, e.g. https://api.devmind.app (or http://localhost:3001 in dev) */
  apiUrl: string;
  /** DevMind API token (dm_sk_*) — generate at /connect */
  apiToken: string;
  /** Target workspace ID */
  workspaceId: string;
  /** Logical service name (e.g. "checkout-api") — appears in dashboard */
  service?: string;
  /** Hostname / pod / instance identifier */
  hostname?: string;
  /** If true, console.error on failed forwards (default: true) */
  verbose?: boolean;
  /**
   * Regex patterns whose matches will be replaced with "<REDACTED>" before sending.
   * Default patterns redact common secrets (API keys, JWTs, password=).
   */
  redactPatterns?: RegExp[];
  /** Default severity for `attachToProcess()` captures (default: critical) */
  defaultSeverity?: IncidentSeverity;
}

export interface ReportIncidentInput {
  type?: IncidentType;
  severity?: IncidentSeverity;
  message: string;
  stack?: string;
  service?: string;
  hostname?: string;
  metadata?: Record<string, unknown>;
}

export interface ReportIncidentResult {
  incidentId: string;
  status: string;
}

const DEFAULT_REDACT: RegExp[] = [
  /\bdm_sk_[A-Za-z0-9_-]+/g,                 // DevMind API tokens
  /\bsk_(?:live|test)_[A-Za-z0-9_-]+/g,      // Stripe keys
  /\bAKIA[0-9A-Z]{16}\b/g,                   // AWS access keys
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, // JWTs
  /\bpassword=([^&\s"']+)/gi,                // password=xxx
  /\bauthorization:\s*bearer\s+\S+/gi,       // bearer tokens in headers
];

export class DevMindMonitor {
  private readonly config: Required<Omit<DevMindMonitorConfig, 'service' | 'hostname'>> & {
    service?: string;
    hostname?: string;
  };
  private attached = false;

  constructor(config: DevMindMonitorConfig) {
    if (!config.apiUrl) throw new Error('DevMindMonitor: apiUrl is required');
    if (!config.apiToken) throw new Error('DevMindMonitor: apiToken is required');
    if (!config.workspaceId) throw new Error('DevMindMonitor: workspaceId is required');

    this.config = {
      apiUrl: config.apiUrl.replace(/\/$/, ''),
      apiToken: config.apiToken,
      workspaceId: config.workspaceId,
      service: config.service,
      hostname: config.hostname ?? this.detectHostname(),
      verbose: config.verbose ?? true,
      redactPatterns: config.redactPatterns ?? DEFAULT_REDACT,
      defaultSeverity: config.defaultSeverity ?? 'critical',
    };
  }

  /**
   * Hook into Node.js process for uncaught exceptions + unhandled rejections.
   * Returns a detach function.
   */
  attachToProcess(): () => void {
    if (this.attached) return () => undefined;
    this.attached = true;

    const onException = (err: Error) => {
      void this.reportIncident({
        type: 'error',
        severity: this.config.defaultSeverity,
        message: err.message,
        stack: err.stack,
        metadata: { source: 'uncaughtException' },
      });
    };

    const onRejection = (reason: unknown) => {
      const err = reason instanceof Error ? reason : new Error(String(reason));
      void this.reportIncident({
        type: 'error',
        severity: this.config.defaultSeverity,
        message: err.message,
        stack: err.stack,
        metadata: { source: 'unhandledRejection' },
      });
    };

    process.on('uncaughtException', onException);
    process.on('unhandledRejection', onRejection);

    return () => {
      process.off('uncaughtException', onException);
      process.off('unhandledRejection', onRejection);
      this.attached = false;
    };
  }

  /**
   * Manually report an incident.
   */
  async reportIncident(input: ReportIncidentInput): Promise<ReportIncidentResult | null> {
    const body = {
      workspaceId: this.config.workspaceId,
      type: input.type ?? 'error',
      severity: input.severity ?? this.config.defaultSeverity,
      service: input.service ?? this.config.service,
      hostname: input.hostname ?? this.config.hostname,
      message: this.redact(input.message),
      stack: input.stack ? this.redact(input.stack) : undefined,
      metadata: input.metadata,
    };

    try {
      const res = await fetch(`${this.config.apiUrl}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        this.log(`DevMindMonitor: POST /incidents failed (${res.status}): ${text}`);
        return null;
      }

      const data = (await res.json()) as { success: boolean; data: ReportIncidentResult };
      return data.data ?? null;
    } catch (err) {
      this.log(`DevMindMonitor: network error sending incident: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  private redact(input: string): string {
    let out = input;
    for (const pattern of this.config.redactPatterns) {
      out = out.replace(pattern, '<REDACTED>');
    }
    return out;
  }

  private detectHostname(): string | undefined {
    try {
      // Avoid hard dependency on 'node:os' for ESM/CJS portability
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const os = require('node:os');
      return os.hostname();
    } catch {
      return process.env.HOSTNAME;
    }
  }

  private log(msg: string) {
    if (this.config.verbose) {
      // eslint-disable-next-line no-console
      console.error(msg);
    }
  }
}

/** Convenience factory. */
export function createMonitor(config: DevMindMonitorConfig): DevMindMonitor {
  return new DevMindMonitor(config);
}
