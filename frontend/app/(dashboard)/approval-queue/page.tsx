"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { ApprovalCard, type PendingMemory as CardPendingMemory } from "@/components/app/approval-card"
import { EmptyState } from "@/components/ui/empty-state"
import { ApprovalCardSkeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EditMemoryDialog, type EditableMemory } from "@/components/app/edit-memory-dialog"
import { pendingApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { ApiError } from "@/lib/api"
import type { PendingMemory } from "@/lib/api-types"

function toCardPending(p: PendingMemory): CardPendingMemory {
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
  const workspaceId = useAuthStore((s) => s.workspace?.id)
  const queryClient = useQueryClient()

  const [approvedId, setApprovedId] = React.useState<string | null>(null)
  const [rejectId, setRejectId] = React.useState<string | null>(null)
  const [approveId, setApproveId] = React.useState<string | null>(null)
  // Local edits stash: keep user changes prior to approve
  const [pendingEdits, setPendingEdits] = React.useState<
    Record<string, { content: string; tags: string[]; type: PendingMemory["type"] }>
  >({})
  const [editMemory, setEditMemory] = React.useState<EditableMemory | null>(null)

  const pendingQuery = useQuery({
    queryKey: ["pending", workspaceId],
    queryFn: () => pendingApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  const rawItems = pendingQuery.data ?? []

  // Apply local edits over server data
  const items: PendingMemory[] = React.useMemo(
    () =>
      rawItems.map((m) => {
        const edit = pendingEdits[m.id]
        if (!edit) return m
        return { ...m, content: edit.content, tags: edit.tags, type: edit.type }
      }),
    [rawItems, pendingEdits],
  )

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["pending", workspaceId] })
    queryClient.invalidateQueries({ queryKey: ["memories", workspaceId] })
    queryClient.invalidateQueries({ queryKey: ["stats", workspaceId] })
    queryClient.invalidateQueries({ queryKey: ["activity", workspaceId] })
  }

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const edit = pendingEdits[id]
      return pendingApi.approve(id, edit?.content, edit?.tags)
    },
    onMutate: (id) => {
      setApprovedId(id)
    },
    onSuccess: (_data, id) => {
      toast.success("Memory approved", { description: "Encrypted and uploaded to Walrus" })
      setPendingEdits((prev) => {
        const { [id]: _omit, ...rest } = prev
        return rest
      })
      invalidateAll()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Approval failed")
    },
    onSettled: () => {
      setApprovedId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => pendingApi.reject(id),
    onSuccess: (_data, id) => {
      toast.success("Memory rejected", { description: "Discarded from pending queue" })
      setPendingEdits((prev) => {
        const { [id]: _omit, ...rest } = prev
        return rest
      })
      invalidateAll()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Reject failed")
    },
  })

  const requestApprove = (id: string) => {
    const m = items.find((x) => x.id === id)
    if (m?.secrets && m.secrets.length > 0) {
      setApproveId(id)
    } else {
      approveMutation.mutate(id)
    }
  }

  const requestReject = (id: string) => {
    setRejectId(id)
  }

  const requestEdit = (id: string) => {
    const m = items.find((x) => x.id === id)
    if (!m) return
    setEditMemory({
      id: m.id,
      content: m.content,
      type: m.type,
      tags: m.tags,
    })
  }

  const handleSaveEdit = (updated: EditableMemory) => {
    setPendingEdits((prev) => ({
      ...prev,
      [updated.id]: {
        content: updated.content,
        tags: updated.tags,
        type: updated.type,
      },
    }))
    toast.success("Memory updated", { description: "Changes saved. Approve to encrypt and upload." })
  }

  const hasSecrets = items.some((m) => (m.secrets?.length ?? 0) > 0)
  const loading = pendingQuery.isLoading
  const loadingId =
    approveMutation.isPending ? approveMutation.variables ?? null :
    rejectMutation.isPending ? rejectMutation.variables ?? null : null

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Approval Queue</h1>
          <p className="text-sm text-[#8B96A0] mt-0.5">
            Review memories before they&apos;re encrypted and stored on Walrus
          </p>
        </div>
        {items.length > 0 && (
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

      {pendingQuery.error && (
        <p className="text-xs text-[#F87171]">
          Failed to load pending memories: {pendingQuery.error instanceof ApiError ? pendingQuery.error.message : "Network error"}
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          <ApprovalCardSkeleton />
          <ApprovalCardSkeleton />
        </div>
      ) : items.length === 0 ? (
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
                memory={toCardPending(memory)}
                onApprove={requestApprove}
                onEdit={requestEdit}
                onReject={requestReject}
                loading={loadingId === memory.id}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={rejectId !== null}
        onOpenChange={(open) => !open && setRejectId(null)}
        title="Reject this memory?"
        description="The memory will be discarded from the pending queue. This action cannot be undone."
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={() => { if (rejectId) rejectMutation.mutate(rejectId); setRejectId(null) }}
      />

      <ConfirmDialog
        open={approveId !== null}
        onOpenChange={(open) => !open && setApproveId(null)}
        title="Approve memory with potential secrets?"
        description="This memory contains highlighted text that may be a secret (API key, token, etc.). It will be encrypted before storage, but consider editing first to remove sensitive values."
        confirmLabel="Approve anyway"
        variant="destructive"
        onConfirm={() => { if (approveId) approveMutation.mutate(approveId); setApproveId(null) }}
      />

      <EditMemoryDialog
        open={editMemory !== null}
        onOpenChange={(open) => !open && setEditMemory(null)}
        memory={editMemory}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
