"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Brain, Filter, LayoutGrid, List, Loader2 } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { Chip, memoryTypeVariant } from "@/components/ui/chip"
import { MemoryCard, type Memory as MemoryCardType } from "@/components/app/memory-card"
import { EmptyState } from "@/components/ui/empty-state"
import { MemoryCardSkeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { memoriesApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import type { Memory } from "@/lib/api-types"

const TYPES = ["all", "decision", "bug", "arch", "note"] as const
const PRIVACY = ["all", "private", "team", "public"] as const

function toCardMemory(m: Memory): MemoryCardType {
  return {
    id: m.id,
    content: m.content,
    type: m.type,
    privacy: m.privacy,
    tags: m.tags,
    author: m.author.displayName ?? m.author.suiAddress.slice(0, 8),
    createdAt: m.createdAt,
    blobId: m.blobId ?? undefined,
  }
}

export default function MemoriesPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id

  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<(typeof TYPES)[number]>("all")
  const [privacyFilter, setPrivacyFilter] = React.useState<(typeof PRIVACY)[number]>("all")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [selected, setSelected] = React.useState<string | null>(null)

  // Debounce query for search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const list = useQuery({
    queryKey: ["memories", workspaceId],
    queryFn: () => memoriesApi.list(workspaceId!),
    enabled: !!workspaceId && !debouncedQuery,
  })

  const search = useQuery({
    queryKey: ["memories-search", workspaceId, debouncedQuery],
    queryFn: () => memoriesApi.search(workspaceId!, debouncedQuery, 20),
    enabled: !!workspaceId && !!debouncedQuery,
  })

  const allMemories: Memory[] = React.useMemo(() => {
    if (debouncedQuery && search.data) {
      // Search results have a subset of fields — adapt
      return search.data.map((r) => ({
        id: r.id,
        workspaceId: workspaceId!,
        content: r.content,
        type: r.type,
        privacy: r.privacy,
        status: "approved",
        tags: r.tags,
        blobId: r.blobId,
        source: r.source,
        sessionId: null,
        author: r.author,
        createdAt: r.createdAt,
        updatedAt: r.createdAt,
      }))
    }
    return list.data ?? []
  }, [debouncedQuery, search.data, list.data, workspaceId])

  const filtered = allMemories.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false
    if (privacyFilter !== "all" && m.privacy !== privacyFilter) return false
    return true
  })

  const isLoading = debouncedQuery ? search.isLoading : list.isLoading
  const isFetching = debouncedQuery ? search.isFetching : list.isFetching
  const selectedMemory = allMemories.find((m) => m.id === selected)

  return (
    <div className="flex gap-6 h-full">
      {/* Left: filter + list */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#E8EDF0]">Memories</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => setView("grid")} className={view === "grid" ? "text-[#ADFF2F]" : ""}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setView("list")} className={view === "list" ? "text-[#ADFF2F]" : ""}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <SearchInput
          placeholder="Search by meaning, not keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          size="lg"
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#4B5563]" />
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-2.5 py-1 text-xs font-mono transition-all duration-150 cursor-pointer ${
                typeFilter === t
                  ? "bg-[rgba(173,255,47,0.15)] text-[#ADFF2F] border border-[rgba(173,255,47,0.3)]"
                  : "bg-[rgba(255,255,255,0.04)] text-[#8B96A0] border border-transparent hover:border-[rgba(255,255,255,0.1)]"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="mx-1 text-[rgba(255,255,255,0.12)]">|</span>
          {PRIVACY.filter((p) => p !== "all").map((p) => (
            <button
              key={p}
              onClick={() => setPrivacyFilter(privacyFilter === p ? "all" : p)}
              className={`rounded-full px-2.5 py-1 text-xs font-mono transition-all duration-150 cursor-pointer ${
                privacyFilter === p
                  ? "bg-[rgba(173,255,47,0.15)] text-[#ADFF2F] border border-[rgba(173,255,47,0.3)]"
                  : "bg-[rgba(255,255,255,0.04)] text-[#8B96A0] border border-transparent hover:border-[rgba(255,255,255,0.1)]"
              }`}
            >
              {p}
            </button>
          ))}
          {isFetching && !isLoading && (
            <Loader2 className="h-3.5 w-3.5 text-[#8B96A0] animate-spin ml-2" />
          )}
        </div>

        {isLoading ? (
          <div className={view === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-3" : "space-y-3"}>
            {[...Array(4)].map((_, i) => (
              <MemoryCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Brain className="h-6 w-6" />}
            title={debouncedQuery ? "No semantic matches" : "No memories yet"}
            description={
              debouncedQuery
                ? `No memories matched "${debouncedQuery}". Try different wording or remove filters.`
                : "Save your first memory via Claude Code or Cursor — they'll appear here after approval."
            }
          />
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-3" : "space-y-3"}>
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

      {/* Right: detail panel */}
      {selectedMemory && (
        <div className="w-80 shrink-0 rounded-[14px] border border-[rgba(173,255,47,0.2)] bg-[#11181C] p-5 h-fit sticky top-6 space-y-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <Chip variant={memoryTypeVariant[selectedMemory.type]} dot>
              {selectedMemory.type}
            </Chip>
          </div>
          <p className="text-sm text-[#E8EDF0] leading-relaxed">{selectedMemory.content}</p>
          {selectedMemory.blobId && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">Walrus Blob ID</p>
              <p className="text-xs font-mono text-[#ADFF2F] bg-[rgba(173,255,47,0.05)] rounded-[6px] px-2.5 py-1.5 break-all">
                {selectedMemory.blobId}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {selectedMemory.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-mono text-[#4B5563] bg-[rgba(255,255,255,0.04)] rounded px-1.5 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-[#4B5563] font-mono">
            by {selectedMemory.author.displayName ?? selectedMemory.author.suiAddress.slice(0, 10)}
          </div>
        </div>
      )}
    </div>
  )
}
