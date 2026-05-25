export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SaveMemoryRequest {
  content: string;
  type: import('./memory').MemoryType;
  privacy?: import('./memory').MemoryPrivacy;
  tags?: string[];
}

export interface SaveMemoryResponse {
  pendingId: string;
  status: 'pending_approval';
  secretFlags: string[];
}

export interface GetMemoryRequest {
  query: string;
  limit?: number;
}

export interface GetMemoryResult {
  id: string;
  content: string;
  type: import('./memory').MemoryType;
  tags: string[];
  score: number;
  createdAt: string;
}

export interface ShareContextRequest {
  context: string;
  targetWorkspace: string;
}

export interface SaveArtifactRequest {
  filename: string;
  contentBase64: string;
  type: import('./memory').ArtifactType;
  relatedMemoryId?: string;
}

export interface SaveArtifactResponse {
  artifactId: string;
  walrusBlobId: string;
}
