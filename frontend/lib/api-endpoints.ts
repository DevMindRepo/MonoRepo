import { apiClient } from "./api"
import type {
  ActivityEvent,
  AgentRun,
  ApiToken,
  ApiTokenWithRaw,
  Artifact,
  ArtifactType,
  AuthChallengeResponse,
  AuthVerifyResponse,
  GitHubWebhook,
  GitHubWebhookWithSecret,
  Incident,
  IncidentWithRuns,
  Memory,
  MemoryPrivacy,
  MemorySearchResult,
  MemoryType,
  PendingMemory,
  Workspace,
  WorkspaceStats,
  WorkspaceWithMembers,
} from "./api-types"

export const authApi = {
  requestChallenge: (suiAddress: string) =>
    apiClient.post<AuthChallengeResponse>("/auth/challenge", { suiAddress }),

  verify: (suiAddress: string, signature: string, displayName?: string) =>
    apiClient.post<AuthVerifyResponse>("/auth/verify", {
      suiAddress,
      signature,
      displayName,
    }),

  me: () =>
    apiClient.get<{ id: string; suiAddress: string; displayName: string | null }>(
      "/auth/me",
    ),
}

export const workspacesApi = {
  list: () => apiClient.get<Workspace[]>("/workspaces"),

  get: (id: string) => apiClient.get<WorkspaceWithMembers>(`/workspaces/${id}`),

  create: (name: string) => apiClient.post<Workspace>("/workspaces", { name }),

  inviteMember: (workspaceId: string, suiAddress: string) =>
    apiClient.post<{ txDigest: string }>(`/workspaces/${workspaceId}/members`, {
      suiAddress,
    }),

  removeMember: (workspaceId: string, userId: string) =>
    apiClient.delete<{ txDigest: string }>(
      `/workspaces/${workspaceId}/members/${userId}`,
    ),
}

export const memoriesApi = {
  list: (workspaceId: string, limit = 50) =>
    apiClient.get<Memory[]>("/memories", { params: { workspaceId, limit } }),

  get: (id: string) => apiClient.get<Memory>(`/memories/${id}`),

  save: (params: {
    workspaceId: string
    content: string
    type: MemoryType
    privacy?: MemoryPrivacy
    tags?: string[]
    source?: string
    sessionId?: string
  }) =>
    apiClient.post<{
      pendingId: string
      status: "pending_approval"
      secretFlags: string[]
    }>("/memories", params),

  search: (workspaceId: string, query: string, limit = 5) =>
    apiClient.post<MemorySearchResult[]>("/memories/search", {
      workspaceId,
      query,
      limit,
    }),
}

export const pendingApi = {
  list: (workspaceId: string) =>
    apiClient.get<PendingMemory[]>("/pending", { params: { workspaceId } }),

  approve: (id: string, editedContent?: string, editedTags?: string[]) =>
    apiClient.post<{ id: string; walrusBlobId: string; status: "approved" }>(
      `/pending/${id}/approve`,
      { editedContent, editedTags },
    ),

  reject: (id: string) =>
    apiClient.post<{ id: string; status: "rejected" }>(`/pending/${id}/reject`),
}

export const artifactsApi = {
  list: (workspaceId: string) =>
    apiClient.get<Artifact[]>("/artifacts", { params: { workspaceId } }),

  get: (id: string) =>
    apiClient.get<{
      artifactId: string
      filename: string
      type: ArtifactType
      sizeBytes: number
      contentBase64: string
    }>(`/artifacts/${id}`),

  upload: (params: {
    workspaceId: string
    filename: string
    contentBase64: string
    type: ArtifactType
    source?: string
    relatedMemoryId?: string
  }) =>
    apiClient.post<{
      artifactId: string
      walrusBlobId: string
      sizeBytes: number
    }>("/artifacts", params),
}

export const apiTokensApi = {
  list: () => apiClient.get<ApiToken[]>("/api-tokens"),

  create: (name: string, workspaceId?: string) =>
    apiClient.post<ApiTokenWithRaw>("/api-tokens", { name, workspaceId }),

  revoke: (id: string) =>
    apiClient.delete<{ id: string; revoked: true }>(`/api-tokens/${id}`),
}

export const webhooksApi = {
  list: (workspaceId: string) =>
    apiClient.get<GitHubWebhook[]>(`/workspaces/${workspaceId}/webhooks`),

  create: (workspaceId: string, repo: string, event = "pull_request") =>
    apiClient.post<GitHubWebhookWithSecret>(
      `/workspaces/${workspaceId}/webhooks`,
      { repo, event },
    ),

  delete: (workspaceId: string, webhookId: string) =>
    apiClient.delete<{ id: string; deleted: true }>(
      `/workspaces/${workspaceId}/webhooks/${webhookId}`,
    ),

  toggle: (workspaceId: string, webhookId: string, active: boolean) =>
    apiClient.patch<{ id: string; active: boolean }>(
      `/workspaces/${workspaceId}/webhooks/${webhookId}`,
      { active },
    ),
}

export const agentRunsApi = {
  list: (workspaceId: string, limit = 50) =>
    apiClient.get<AgentRun[]>("/agent-runs", { params: { workspaceId, limit } }),

  get: (id: string) => apiClient.get<AgentRun>(`/agent-runs/${id}`),
}

export const incidentsApi = {
  list: (workspaceId: string, opts?: { limit?: number; status?: string }) =>
    apiClient.get<Incident[]>("/incidents", {
      params: { workspaceId, limit: opts?.limit ?? 50, status: opts?.status },
    }),

  get: (id: string) => apiClient.get<IncidentWithRuns>(`/incidents/${id}`),

  resolve: (id: string, resolutionNotes: string) =>
    apiClient.post<Incident>(`/incidents/${id}/resolve`, { resolutionNotes }),

  retry: (id: string) => apiClient.post<{ id: string; status: string }>(`/incidents/${id}/retry`),
}

export const statsApi = {
  workspace: (workspaceId: string) =>
    apiClient.get<WorkspaceStats>("/stats", { params: { workspaceId } }),

  activity: (workspaceId: string, limit = 20) =>
    apiClient.get<ActivityEvent[]>("/activity", {
      params: { workspaceId, limit },
    }),
}
