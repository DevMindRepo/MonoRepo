import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth
  JWT_SECRET: z.string().min(32),

  // Sui
  SUI_NETWORK: z.enum(['testnet', 'mainnet', 'devnet', 'localnet']).default('testnet'),
  // Mnemonic (12+ words) OR bech32 private key (starts with "suiprivkey1...")
  SUI_MASTER_WALLET_KEY: z.string().min(1),
  WORKSPACE_REGISTRY_PACKAGE_ID: z.string().default('0x0'),
  SEAL_POLICY_PACKAGE_ID: z.string().default('0x0'),
  SEAL_POLICY_OBJECT_ID: z.string().default('0x0'),

  // Walrus (kept for aggregator URL — used in dashboard "view raw blob" links)
  WALRUS_AGGREGATOR_URL: z.string().url().default('https://aggregator.walrus-testnet.walrus.space'),

  // MemWal (Walrus Memory layer — handles storage, encryption, embedding, search)
  MEMWAL_RELAYER_URL: z.string().url().default('https://relayer.staging.memwal.ai'),
  MEMWAL_ACCOUNT_ID: z.string().min(1),
  MEMWAL_DELEGATE_KEY: z.string().min(1),

  // Gemini (kept for LLM reasoning in agents + GitHub webhook decision extractor)
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_CHAT_MODEL: z.string().default('gemini-2.5-flash-lite'),

  // GitHub
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_APP_TOKEN: z.string().optional(),

  // Pending queue
  PENDING_TTL_SECONDS: z.coerce.number().default(86400),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  cached = parsed.data;
  return cached;
}
