import { z } from 'zod';

const envSchema = z.object({
  // DevMind backend
  DEVMIND_API_BASE_URL: z.string().url().default('http://localhost:3001'),
  DEVMIND_API_TOKEN: z.string().min(1, 'DEVMIND_API_TOKEN required (dm_sk_* token from /connect)'),
  DEVMIND_WORKSPACE_ID: z.string().min(1, 'DEVMIND_WORKSPACE_ID required'),

  // GitHub
  GITHUB_APP_TOKEN: z.string().min(1, 'GITHUB_APP_TOKEN required (PAT with repo scope)'),

  // Gemini (for reasoning)
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY required'),
  GEMINI_CHAT_MODEL: z.string().default('gemini-2.5-flash'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`Invalid environment variables:\n${issues}`);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}
