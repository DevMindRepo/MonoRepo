// Response shapes from DevMind backend.
// These mirror the field names returned by the API (after backend mapper layer).
// Keep in sync with backend routes in /backend/src/routes/.

export type MemoryType = "decision" | "bug" | "arch" | "note"
export type MemoryPrivacy = "private" | "team" | "public"
export type ArtifactType = "dataset" | "log" | "report" | "output"

export interface AuthorRef {
  id: string
  displayName: string | null
  suiAddress: string
}

export interface AuthChallengeResponse {
  message: string
}

export interface AuthVerifyResponse {
  token: string
  user: {
    id: string
    suiAddress: string
    displayName: string | null
  }
}

export interface Workspace {
  id: string
  name: string
  ownerId: string
  suiObjectId: string | null
  walrusRoot: string | null
  createdAt: string
  role?: string
  joinedAt?: string
  txDigest?: string
}

export interface WorkspaceWithMembers extends Workspace {
  members: Array<{
    workspaceId: string
    userId: string
    role: string
    joinedAt: string
    user: {
      id: string
      suiAddress: string
      displayName: string | null
    }
  }>
}

export interface Memory {
  id: string
  workspaceId: string
  content: string
  type: MemoryType
  privacy: MemoryPrivacy
  status: string
  tags: string[]
  blobId: string | null
  source: string | null
  sessionId: string | null
  author: AuthorRef
  createdAt: string
  updatedAt: string
}

export interface MemorySearchResult {
  id: string
  content: string
  type: MemoryType
  privacy: MemoryPrivacy
  tags: string[]
  blobId: string | null
  source: string | null
  score: number
  author: AuthorRef
  createdAt: string
}

export interface PendingMemory {
  id: string
  content: string
  type: MemoryType
  privacy: MemoryPrivacy
  tags: string[]
  source: string
  sessionId: string | null
  workspaceId: string
  workspaceName?: string
  secrets: Array<{ pattern: string; index: number; length: number }>
  author: AuthorRef | null
  createdAt: string
  expiresAt: string
}

export interface Artifact {
  id: string
  workspaceId: string
  filename: string
  type: ArtifactType
  blobId: string
  sizeBytes: number
  source: string | null
  relatedMemoryId: string | null
  author: AuthorRef
  createdAt: string
}

export interface ApiToken {
  id: string
  name: string
  prefix: string
  workspaceId: string | null
  lastUsedAt: string | null
  createdAt: string
}

export interface ApiTokenWithRaw extends ApiToken {
  token: string
  message: string
}

export interface GitHubWebhook {
  id: string
  repo: string
  event: string
  active: boolean
  lastDeliveryAt: string | null
  createdAt: string
}

export interface GitHubWebhookWithSecret extends GitHubWebhook {
  secret: string
  message: string
}

export interface AgentRun {
  id: string
  workspaceId: string
  agentName: string
  prNumber: number | null
  prTitle: string | null
  prUrl: string | null
  status: "running" | "completed" | "failed"
  reasoning: string | null
  comment: string | null
  memoriesQueried: string[]
  reviewPosted: boolean
  durationMs: number | null
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

export interface WorkspaceStats {
  totalMemories: number
  memoriesThisWeek: number
  pendingCount: number
  agentRunsTotal: number
  agentRunsThisWeek: number
  walrusStorageBytes: number
  artifactsCount: number
  byType: Record<MemoryType, number>
}

export type ActivityEvent =
  | {
      type: "memory_saved"
      id: string
      text: string
      sub: string
      actor: string
      timestamp: string
    }
  | {
      type: "agent_run"
      id: string
      text: string
      sub: string
      actor: string
      timestamp: string
    }
  | {
      type: "member_joined"
      id: string
      text: string
      sub: string
      actor: string
      timestamp: string
    }
