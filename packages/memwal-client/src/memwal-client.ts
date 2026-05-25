import type { MemwalConfig, WriteResult, ReadResult } from './types.js';

export class MemwalClient {
  private config: Required<MemwalConfig>;

  constructor(config: MemwalConfig) {
    this.config = {
      publisherUrl: config.publisherUrl,
      aggregatorUrl: config.aggregatorUrl,
      epochs: config.epochs ?? 5,
    };
  }

  async write(data: Uint8Array): Promise<WriteResult> {
    const url = `${this.config.publisherUrl}/v1/blobs?epochs=${this.config.epochs}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`Walrus write failed: ${res.status} ${await res.text()}`);
    }

    const json = await res.json() as any;
    const blobId: string =
      json.newlyCreated?.blobObject?.blobId ??
      json.alreadyCertified?.blobId;

    if (!blobId) {
      throw new Error('Walrus write: no blobId in response');
    }

    return { blobId, size: data.length, epochs: this.config.epochs };
  }

  async read(blobId: string): Promise<ReadResult> {
    const url = `${this.config.aggregatorUrl}/v1/blobs/${blobId}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Walrus read failed: ${res.status} ${await res.text()}`);
    }

    const buffer = await res.arrayBuffer();
    return { data: new Uint8Array(buffer), blobId };
  }
}
