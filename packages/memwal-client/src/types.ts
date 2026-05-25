export interface MemwalConfig {
  publisherUrl: string;
  aggregatorUrl: string;
  epochs?: number;
}

export interface WriteResult {
  blobId: string;
  size: number;
  epochs: number;
}

export interface ReadResult {
  data: Uint8Array;
  blobId: string;
}
