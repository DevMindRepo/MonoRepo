import { createHash, randomBytes } from 'node:crypto';

const TOKEN_PREFIX = 'dm_sk_';

export interface GeneratedToken {
  raw: string;
  hash: string;
  prefix: string;
}

export function generateApiToken(): GeneratedToken {
  const secret = randomBytes(32).toString('base64url');
  const raw = `${TOKEN_PREFIX}${secret}`;
  const hash = createHash('sha256').update(raw).digest('hex');
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}

export function hashApiToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function isApiToken(value: string): boolean {
  return value.startsWith(TOKEN_PREFIX);
}
