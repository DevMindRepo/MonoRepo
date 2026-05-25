import { MemwalClient } from '@devmind/memwal-client';
import { getEnv } from '../lib/env.js';

let cached: MemwalClient | null = null;

export function getWalrusClient(): MemwalClient {
  if (cached) return cached;
  const env = getEnv();
  cached = new MemwalClient({
    publisherUrl: env.WALRUS_PUBLISHER_URL,
    aggregatorUrl: env.WALRUS_AGGREGATOR_URL,
    epochs: env.WALRUS_EPOCHS,
  });
  return cached;
}

export async function uploadToWalrus(data: Uint8Array): Promise<string> {
  const client = getWalrusClient();
  const result = await client.write(data);
  return result.blobId;
}

export async function downloadFromWalrus(blobId: string): Promise<Uint8Array> {
  const client = getWalrusClient();
  const result = await client.read(blobId);
  return result.data;
}
