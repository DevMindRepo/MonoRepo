"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { ApprovalCard, type PendingMemory as PendingCardMemory } from "@/components/app/approval-card"
import { EmptyState } from "@/components/ui/empty-state"
import { ApprovalCardSkeleton } from "@/components/ui/skeleton"
import { pendingApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import type { PendingMemory } from "@/lib/api-types"
import { ApiError } from "@/lib/api"

function toCardMemory(p: PendingMemory): PendingCardMemory {
  return {
    id: p.id,
    content: p.content,
    type: p.type,
    tags: p.tags,
    source: p.source,
    sessionId: p.sessionId ?? "",
    workspaceName: p.workspaceName ?? "",
    createdAt: p.createdAt,
    secrets: p.secrets,
  }
}

export default function ApprovalQueuePage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id
  const queryClient = useQueryClient()

  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [approvedId, setApprovedId] = React.useState<string | null>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ["pending", workspaceId],
    queryFn: () => pendingApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["pending", workspaceId] })
    queryClient.invalidateQueries({ queryKey: ["memories", workspaceId] })
    queryClient.invalidateQueries({ queryKey: ["stats", workspaceId] })
    queryClient.invalidateQueries({ queryKey: ["activity", workspaceId] })
  }

  async function handleApprove(id: string) {
    setLoadingId(id)
    try {
      const result = await pendingApi.approve(id)
      setApprovedId(id)
      toast.success("Memory uploaded to Walrus", {
        description: result.walrusBlobId.slice(0, 16) + "…",
      })
      await new Promise((r) => setTimeout(r, 500))
      invalidate()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to approve"
      toast.error(message)
    } finally {
      setLoadingId(null)
      setApprovedId(null)
    }
  }

  async function handleReject(id: string) {
    try {
      await pendingApi.reject(id)
      toast.success("Memory rejected")
      invalidate()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to reject"
      toast.error(message)
    }
  }

  function handleEdit(id: string) {
    toast.info("Inline editing coming soon", { description: `pending: ${id.slice(0, 8)}…` })
  }

  const hasSecrets = items?.some((m) => m.secrets.length > 0) ?? false

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E8EDF0]">Approval Queue</h1>
          <p className="text-sm text-[#8B96A0] mt-0.5">
            Review memories before they're encrypted and stored on Walrus
          </p>
        </div>
        {items && items.length > 0 && (
          <span className="rounded-full border border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.1)] px-3 py-1 text-sm font-mono text-[#F472B6]">
            {items.length} pending
          </span>
        )}
      </div>

      {hasSecrets && (
        <div className="flex items-start gap-3 rounded-[12px] border border-[rgba(244,114,182,0.2)] bg-[rgba(244,114,182,0.05)] px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-[#F472B6] shrink-0 mt-0.5" />
          <p className="text-sm text-[#F472B6]">
            One or more memories contain potential secrets. Review highlighted text before approving.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <ApprovalCardSkeleton />
          <ApprovalCardSkeleton />
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="h-6 w-6" />}
          title="Queue is clear"
          description="All memories have been reviewed. New memories saved by your AI tools will appear here."
        />
      ) : (
        <div className="space-y-4">
          {items.map((memory) => (
            <div key={memory.id} className="relative">
              {approvedId === memory.id && (
                <div className="absolute inset-0 rounded-[14px] z-10 flex items-center justify-center bg-[rgba(173,255,47,0.05)] border border-[rgba(173,255,47,0.3)]">
                  <div className="flex items-center gap-2 text-[#ADFF2F] text-sm font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Uploading to Walrus…
                  </div>
                </div>
              )}
              <ApprovalCard
                memory={toCardMemory(memory)}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onReject={handleReject}
                loading={loadingId === memory.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
