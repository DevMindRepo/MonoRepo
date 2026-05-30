/**
 * Walrus raw HTTP wrapper — used ONLY for artifact (binary file) storage.
 *
 * Memory content goes through MemWal SDK (which uses Walrus underneath).
 * Artifacts use raw Walrus directly because MemWal's remember() is text-oriented.
 *
 * Note: artifacts are stored UNENCRYPTED on Walrus in Phase 1.
 * Phase 2 roadmap: pipe artifact bytes through Seal before upload.
 */
import { getEnv } from '../lib/env.js';

const PUBLISHER_URL = 'https://publisher.walrus-testnet.walrus.space';
const EPOCHS = 5;

export async function uploadToWalrus(data: Uint8Array): Promise<string> {
  const url = `${PUBLISHER_URL}/v1/blobs?epochs=${EPOCHS}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: data as unknown as ArrayBuffer,
  });

  if (!res.ok) {
    throw new Error(`Walrus upload failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as any;
  const blobId: string | undefined =
    json.newlyCreated?.blobObject?.blobId ?? json.alreadyCertified?.blobId;
  if (!blobId) throw new Error('Walrus upload: missing blobId in response');
  return blobId;
}

export async function downloadFromWalrus(blobId: string): Promise<Uint8Array> {
  const env = getEnv();
  const url = `${env.WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Walrus download failed: ${res.status} ${await res.text()}`);
  }
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}
