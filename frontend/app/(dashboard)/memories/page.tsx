"use client"

import * as React from "react"
import { Brain, Filter, LayoutGrid, List, Search, X } from "lucide-react"
import { Chip, memoryTypeVariant } from "@/components/ui/chip"
import { MemoryCard, type Memory } from "@/components/app/memory-card"
import { EmptyState } from "@/components/ui/empty-state"
import { MemoryCardSkeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn, timeAgo } from "@/lib/utils"

const MOCK_MEMORIES: Memory[] = [
  { id: "m1", content: "Use pgvector with HNSW index (m=16, ef_construction=64) for all semantic search. Benchmarks show 12ms P95 on 100k vectors. Migration: add vector column to memories table, backfill via batch job.", type: "decision", privacy: "team", tags: ["database", "pgvector", "performance"], author: "you", createdAt: new Date(Date.now() - 2 * 86400000), blobId: "7xK2mN9pQ1rS3tU5vW7xY9zA" },
  { id: "m2", content: "React 19 hydration mismatch with Zustand SSR: wrap localStorage reads in useEffect. Confirmed fixed with Zustand 5.0 + suppressHydrationWarning on container.", type: "bug", privacy: "team", tags: ["react19", "zustand", "ssr"], author: "you", createdAt: new Date(Date.now() - 3 * 86400000), blobId: "3bC5dE7fG9hI1jK2lM4nO6pQ" },
  { id: "m3", content: "Seal Minimal: DevMind backend is the decryption proxy. seal_approve checks ctx.sender() == DEVMIND_MASTER_WALLET. Phase 2: migrate to Seal Full with per-member on-chain access control.", type: "arch", privacy: "team", tags: ["seal", "encryption", "sui"], author: "alisa", createdAt: new Date(Date.now() - 5 * 86400000), blobId: "9rS2tU4vW6xY8zA1bC3dE5fG" },
  { id: "m4", content: "MCP config goes in ~/.claude.json for Claude Code CLI. NOT claude_desktop_config.json — that's Claude Desktop. Use server.registerTool() not server.tool() (old API).", type: "note", privacy: "team", tags: ["mcp", "claude-code", "config"], author: "you", createdAt: new Date(Date.now() - 7 * 86400000) },
  { id: "m5", content: "No BullMQ for MVP. Redis used as simple pending queue + cache only (24h TTL on pending memories). Job workers are over-engineering for hackathon scope.", type: "decision", privacy: "team", tags: ["redis", "architecture", "mvp"], author: "you", createdAt: new Date(Date.now() - 8 * 86400000) },
  { id: "m6", content: "PR #231: switched from custom JWT refresh to Sui wallet signature verification. JWT still issued after verification for API calls. Stateless scalability maintained.", type: "decision", privacy: "private", tags: ["auth", "jwt", "sui", "security"], author: "you", createdAt: new Date(Date.now() - 10 * 86400000), blobId: "1jK8lM2nO4pQ6rS0tU2vW4xY" },
]

const TYPES = ["all", "decision", "bug", "arch", "note"] as const
const PRIVACY = ["all", "private", "team", "public"] as const

const TYPE_COUNTS = {
  decision: MOCK_MEMORIES.filter(m => m.type === "decision").length,
  bug: MOCK_MEMORIES.filter(m => m.type === "bug").length,
  arch: MOCK_MEMORIES.filter(m => m.type === "arch").length,
  note: MOCK_MEMORIES.filter(m => m.type === "note").length,
}

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 20px rgba(0,0,0,0.4)",
} as React.CSSProperties

export default function MemoriesPage() {
  const [query, setQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<(typeof TYPES)[number]>("all")
  const [privacyFilter, setPrivacyFilter] = React.useState<(typeof PRIVACY)[number]>("all")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  const filtered = MOCK_MEMORIES.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false
    if (privacyFilter !== "all" && m.privacy !== privacyFilter) return false
    if (query && !m.content.toLowerCase().includes(query.toLowerCase()) && !m.tags.some(t => t.includes(query.toLowerCase()))) return false
    return true
  })

  const selectedMemory = MOCK_MEMORIES.find((m) => m.id === selected)

  return (
    <div className="flex flex-col gap-5 h-full w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Memories</h1>
          <p className="mt-0.5 text-sm text-[#8B96A0]">{MOCK_MEMORIES.length} stored · encrypted on Walrus</p>
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
              {t !== "all" && <span className="opacity-50">{TYPE_COUNTS[t as keyof typeof TYPE_COUNTS]}</span>}
            </button>
          ))}
          <span className="text-[rgba(255,255,255,0.12)]">·</span>
          {PRIVACY.filter(p => p !== "all").map((p) => (
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
              icon={<Brain className="h-6 w-6" />}
              title="No memories found"
              description={query ? `No results for "${query}". Try different keywords or remove filters.` : "No memories match the current filters."}
            />
          ) : (
            <div className={cn(view === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" : "space-y-2")}>
              {filtered.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  selected={selected === m.id}
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedMemory && (
          <div className="lg:w-72 xl:w-80 shrink-0 w-full rounded-2xl p-5 lg:sticky lg:top-0 space-y-4" style={glass}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: "linear-gradient(90deg, transparent, rgba(173,255,47,0.5), transparent)" }} />

            <div className="flex items-center justify-between">
              <Chip variant={memoryTypeVariant[selectedMemory.type]} dot>{selectedMemory.type}</Chip>
              <button onClick={() => setSelected(null)} className="text-[#4B5563] hover:text-[#8B96A0] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-[#E8EDF0] leading-relaxed">{selectedMemory.content}</p>

            {selectedMemory.blobId && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Walrus Blob ID</p>
                <p className="text-xs font-mono text-[#ADFF2F] rounded-[8px] px-2.5 py-2 break-all"
                  style={{ background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.15)" }}>
                  {selectedMemory.blobId}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMemory.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-[#8B96A0] rounded-md px-1.5 py-0.5"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-3 text-[11px] font-mono text-[#4B5563]">
              <span>by {selectedMemory.author}</span>
              <span>{timeAgo(selectedMemory.createdAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
