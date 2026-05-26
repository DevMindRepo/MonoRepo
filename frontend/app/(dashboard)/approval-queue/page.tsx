"use client"

import * as React from "react"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { ApprovalCard, type PendingMemory } from "@/components/app/approval-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton, ApprovalCardSkeleton } from "@/components/ui/skeleton"

const MOCK_PENDING: PendingMemory[] = [
  {
    id: "pend_001",
    content: `Decision: Use pgvector extension on PostgreSQL 16 for all semantic search operations in DevMind.

Rationale: pgvector integrates directly with our existing Prisma + PostgreSQL stack. Benchmarks show 95th percentile query latency of ~12ms on 100k vectors with HNSW index. Avoids introducing a separate vector DB (Pinecone, Weaviate) and associated network latency + cost.

Migration path: add vector column to memories table, backfill embeddings via batch job, create HNSW index with m=16 ef_construction=64.`,
    type: "decision",
    tags: ["database", "vector-search", "postgresql", "performance"],
    source: "Claude Code",
    sessionId: "sess_abc123",
    workspaceName: "devmind-core",
    createdAt: new Date(Date.now() - 8 * 60000),
  },
  {
    id: "pend_002",
    content: `Bug: React 19 hydration mismatch when using Zustand with SSR in Next.js 16.

Root cause: Zustand store initializes on server with default state, but client hydrates with a different state if localStorage is read during initialization. The mismatch triggers hydration errors.

Fix: wrap localStorage reads in useEffect, or use the zustand/react/shallow selector with suppressHydrationWarning on the container div. Confirmed working with Zustand 5.0.

Note: NEXT_PUBLIC_API_KEY=sk-abc123-do-not-commit`,
    type: "bug",
    tags: ["react19", "zustand", "nextjs", "ssr", "hydration"],
    source: "Claude Code",
    sessionId: "sess_def456",
    workspaceName: "devmind-core",
    createdAt: new Date(Date.now() - 25 * 60000),
    secrets: [
      { pattern: "API Key", index: 278, length: 30 },
    ],
  },
  {
    id: "pend_003",
    content: `Architecture note: Seal Minimal implementation for DevMind MVP.

DevMind backend acts as the decryption proxy using a master Sui wallet. The seal_approve function in the Move contract checks that ctx.sender() == DEVMIND_MASTER_WALLET. This is intentionally simple for Phase 1 — it means users trust DevMind to decrypt on their behalf.

Phase 2 roadmap: migrate to Seal Full with on-chain access control per workspace member. Each member gets their own encryption key derived from their Sui wallet.`,
    type: "arch",
    tags: ["seal", "encryption", "sui", "phase1", "security"],
    source: "Cursor",
    sessionId: "sess_ghi789",
    workspaceName: "devmind-core",
    createdAt: new Date(Date.now() - 60 * 60000),
  },
]

export default function ApprovalQueuePage() {
  const [items, setItems] = React.useState<PendingMemory[]>(MOCK_PENDING)
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [approvedId, setApprovedId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    await new Promise((r) => setTimeout(r, 1200))
    setApprovedId(id)
    await new Promise((r) => setTimeout(r, 600))
    setItems((prev) => prev.filter((m) => m.id !== id))
    setLoadingId(null)
    setApprovedId(null)
  }

  const handleReject = (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id))
  }

  const handleEdit = (id: string) => {
    console.log("edit", id)
  }

  const hasSecrets = items.some((m) => (m.secrets?.length ?? 0) > 0)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#E8EDF0]">Approval Queue</h1>
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
                memory={memory}
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
