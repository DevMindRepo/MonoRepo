import { z } from 'zod';

const envSchema = z.object({
  DEVMIND_API_BASE_URL: z.string().url().default('http://localhost:3001'),
  DEVMIND_API_TOKEN: z.string().min(1, 'DEVMIND_API_TOKEN required (JWT from dashboard)'),
  DEVMIND_WORKSPACE_ID: z.string().min(1, 'DEVMIND_WORKSPACE_ID required'),
});

export type Config = z.infer<typeof envSchema>;

let cached: Config | null = null;

export function getConfig(): Config {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    console.error('Invalid MCP config:', JSON.stringify(errors, null, 2));
    throw new Error('Missing required env vars for DevMind MCP server');
  }
  cached = parsed.data;
  return cached;
}
