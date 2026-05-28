"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, LayoutGrid, List, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Chip, memoryTypeVariant } from "@/components/ui/chip"
import { MemoryCard, type Memory as CardMemory } from "@/components/app/memory-card"
import { EmptyState } from "@/components/ui/empty-state"
import { MemoryCardSkeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn, timeAgo } from "@/lib/utils"
import { memoriesApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { ApiError } from "@/lib/api"
import type { Memory, MemorySearchResult } from "@/lib/api-types"

const TYPES = ["all", "decision", "bug", "arch", "note"] as const
const PRIVACY = ["all", "private", "team", "public"] as const

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.4)",
} as React.CSSProperties

type UnifiedMemory = {
  id: string
  content: string
  type: Memory["type"]
  privacy: Memory["privacy"]
  tags: string[]
  memwalMemoryId: string | null
  author: { displayName: string | null; suiAddress: string }
  createdAt: string
}

function authorLabel(a: { displayName: string | null; suiAddress: string }): string {
  return a.displayName ?? a.suiAddress.slice(0, 8)
}

function toCardMemory(m: UnifiedMemory): CardMemory {
  return {
    id: m.id,
    content: m.content,
    type: m.type,
    privacy: m.privacy,
    tags: m.tags,
    author: authorLabel(m.author),
    createdAt: m.createdAt,
    blobId: m.memwalMemoryId ?? undefined,
  }
}

function fromMemory(m: Memory): UnifiedMemory {
  return {
    id: m.id,
    content: m.content,
    type: m.type,
    privacy: m.privacy,
    tags: m.tags,
    memwalMemoryId: m.memwalMemoryId,
    author: { displayName: m.author.displayName, suiAddress: m.author.suiAddress },
    createdAt: m.createdAt,
  }
}

function fromSearchResult(r: MemorySearchResult): UnifiedMemory {
  return {
    id: r.id,
    content: r.content,
    type: r.type,
    privacy: r.privacy,
    tags: r.tags,
    memwalMemoryId: r.memwalMemoryId,
    author: { displayName: r.author.displayName, suiAddress: r.author.suiAddress },
    createdAt: r.createdAt,
  }
}

export default function MemoriesPage() {
  const workspaceId = useAuthStore((s) => s.workspace?.id)
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<(typeof TYPES)[number]>("all")
  const [privacyFilter, setPrivacyFilter] = React.useState<(typeof PRIVACY)[number]>("all")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const listQuery = useQuery({
    queryKey: ["memories", workspaceId],
    queryFn: () => memoriesApi.list(workspaceId!, 100),
    enabled: !!workspaceId,
  })

  const searchQuery = useQuery({
    queryKey: ["memories-search", workspaceId, debouncedQuery],
    queryFn: () => memoriesApi.search(workspaceId!, debouncedQuery, 20),
    enabled: !!workspaceId && debouncedQuery.length > 0,
  })

  const isSearching = debouncedQuery.length > 0
  const loading = isSearching ? searchQuery.isLoading : listQuery.isLoading

  const memories: UnifiedMemory[] = React.useMemo(() => {
    if (isSearching) {
      return (searchQuery.data ?? []).map(fromSearchResult)
    }
    return (listQuery.data ?? []).map(fromMemory)
  }, [isSearching, searchQuery.data, listQuery.data])

  const typeCounts = React.useMemo(() => ({
    decision: memories.filter((m) => m.type === "decision").length,
    bug: memories.filter((m) => m.type === "bug").length,
    arch: memories.filter((m) => m.type === "arch").length,
    note: memories.filter((m) => m.type === "note").length,
  }), [memories])

  const filtered = memories.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false
    if (privacyFilter !== "all" && m.privacy !== privacyFilter) return false
    return true
  })

  const selectedMemory = memories.find((m) => m.id === selected)

  const handleDelete = (_id: string) => {
    toast.info("Coming soon", { description: "Memory delete is not yet supported" })
  }

  const errorMsg = (listQuery.error ?? searchQuery.error) instanceof ApiError
    ? ((listQuery.error ?? searchQuery.error) as ApiError).message
    : null

  return (
    <div className="flex flex-col gap-5 h-full w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Memories</h1>
          <p className="mt-0.5 text-sm text-[#8B96A0]">{memories.length} stored · encrypted on Walrus</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView("grid")}
            className={cn("flex h-8 w-8 items-center justify-center rounded-[8px] transition-all duration-150",
              view === "grid" ? "bg-[rgba(173,255,47,0.1)] text-[#ADFF2F]" : "text-[#4B5563] hover:text-[#8B96A0] hover:bg-[rgba(255,255,255,0.04)]"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn("flex h-8 w-8 items-center justify-center rounded-[8px] transition-all duration-150",
              view === "list" ? "bg-[rgba(173,255,47,0.1)] text-[#ADFF2F]" : "text-[#4B5563] hover:text-[#8B96A0] hover:bg-[rgba(255,255,255,0.04)]"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by meaning, not keyword…"
            className="w-full rounded-[12px] py-2.5 pl-10 pr-10 text-sm text-[#E8EDF0] placeholder:text-[#4B5563] focus:outline-none transition-all duration-200"
            style={{
              background: "rgba(17,25,35,0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: query ? "1px solid rgba(173,255,47,0.3)" : "1px solid rgba(255,255,255,0.09)",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#8B96A0]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 shrink-0 text-[#4B5563]" />
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono transition-all duration-150 cursor-pointer",
                typeFilter === t
                  ? "text-[#ADFF2F] border"
                  : "text-[#8B96A0] border border-transparent hover:border-[rgba(255,255,255,0.1)] hover:text-[#E8EDF0]"
              )}
              style={typeFilter === t ? { background: "rgba(173,255,47,0.1)", borderColor: "rgba(173,255,47,0.25)" } : { background: "rgba(255,255,255,0.04)" }}
            >
              {t}
              {t !== "all" && <span className="opacity-50">{typeCounts[t as keyof typeof typeCounts]}</span>}
            </button>
          ))}
          <span className="text-[rgba(255,255,255,0.12)]">·</span>
          {PRIVACY.filter((p) => p !== "all").map((p) => (
            <button
              key={p}
              onClick={() => setPrivacyFilter(privacyFilter === p ? "all" : p)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-mono transition-all duration-150 cursor-pointer border",
                privacyFilter === p
                  ? "text-[#ADFF2F] border-[rgba(173,255,47,0.25)]"
                  : "text-[#8B96A0] border-transparent hover:border-[rgba(255,255,255,0.1)] hover:text-[#E8EDF0]"
              )}
              style={{ background: privacyFilter === p ? "rgba(173,255,47,0.1)" : "rgba(255,255,255,0.04)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-[#F87171]">Failed to load memories: {errorMsg}</p>
      )}

      {/* Content area */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Cards */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={cn(view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" : "space-y-2")}>
              {[...Array(4)].map((_, i) => <MemoryCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              image="/empty-memories.png"
              title="No memories found"
              description={isSearching ? `No results for "${debouncedQuery}". Try different keywords or remove filters.` : "No memories match the current filters."}
            />
          ) : (
            <div className={cn(view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" : "space-y-2")}>
              {filtered.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={toCardMemory(m)}
                  selected={selected === m.id}
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedMemory && (
          <div className="relative lg:w-72 xl:w-80 shrink-0 w-full rounded-2xl p-5 lg:sticky lg:top-0 lg:self-start space-y-4 overflow-hidden" style={glass}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: "linear-gradient(90deg, transparent, rgba(173,255,47,0.5), transparent)" }} />

            <div className="flex items-center justify-between">
              <Chip variant={memoryTypeVariant[selectedMemory.type]} dot>{selectedMemory.type}</Chip>
              <button onClick={() => setSelected(null)} className="text-[#4B5563] hover:text-[#8B96A0] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-[#E8EDF0] leading-relaxed">{selectedMemory.content}</p>

            {selectedMemory.memwalMemoryId && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">MemWal Memory ID</p>
                <p className="text-xs font-mono text-[#ADFF2F] rounded-[8px] px-2.5 py-2 break-all"
                  style={{ background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.15)" }}>
                  {selectedMemory.memwalMemoryId}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMemory.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-[#ADFF2F] rounded-md px-1.5 py-0.5"
                    style={{ background: "rgba(173,255,47,0.08)", border: "1px solid rgba(173,255,47,0.18)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-3 text-[11px] font-mono text-[#4B5563]">
              <span>by {authorLabel(selectedMemory.author)}</span>
              <span>{timeAgo(selectedMemory.createdAt)}</span>
            </div>
            <button
              onClick={() => setDeleteId(selectedMemory.id)}
              className="w-full flex items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-medium text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] transition-colors duration-150"
              style={{ border: "1px solid rgba(248,113,113,0.18)" }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete memory
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this memory?"
        description="The blob will be marked for deletion on Walrus. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => { if (deleteId) handleDelete(deleteId); setDeleteId(null) }}
      />
    </div>
  )
}
