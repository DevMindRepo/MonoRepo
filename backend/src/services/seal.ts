import { SealClient } from '@devmind/seal-client';
import { getSuiClient } from './sui.js';
import { getEnv } from '../lib/env.js';

let cached: SealClient | null = null;

export function getSealClient(): SealClient {
  if (cached) return cached;
  const env = getEnv();
  cached = new SealClient({
    packageId: env.SEAL_POLICY_PACKAGE_ID,
    suiClient: getSuiClient(),
  });
  return cached;
}

/**
 * Encrypt content for storage on Walrus. The `id` is the memory ID used as
 * key derivation tag; Seal binds the encryption to this id.
 */
export async function encryptForStorage(content: string, id: string): Promise<Uint8Array> {
  const client = getSealClient();
  const data = new TextEncoder().encode(content);
  const result = await client.encrypt(data, id);
  return result.encryptedData;
}
