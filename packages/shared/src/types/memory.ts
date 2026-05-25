export type MemoryType = 'decision' | 'bug' | 'arch' | 'note';
export type MemoryPrivacy = 'private' | 'team' | 'public';
export type MemoryStatus = 'pending_approval' | 'approved' | 'rejected';
export type ArtifactType = 'dataset' | 'log' | 'report' | 'output';

export interface Memory {
  id: string;
  workspaceId: string;
  authorId: string;
  content: string;
  type: MemoryType;
  privacy: MemoryPrivacy;
  status: MemoryStatus;
  tags: string[];
  walrusBlobId?: string;
  embeddingId?: string;
  source?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Artifact {
  id: string;
  workspaceId: string;
  authorId: string;
  filename: string;
  type: ArtifactType;
  walrusBlobId: string;
  sizeBytes: number;
  source?: string;
  relatedMemoryId?: string;
  createdAt: Date;
}

export interface PendingMemory {
  pendingId: string;
  workspaceId: string;
  authorId: string;
  content: string;
  type: MemoryType;
  privacy: MemoryPrivacy;
  tags: string[];
  secretFlags: string[];
  source?: string;
  sessionId?: string;
  createdAt: number;
  expiresAt: number;
}
