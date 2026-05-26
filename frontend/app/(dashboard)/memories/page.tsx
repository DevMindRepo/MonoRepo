"use client"

import * as React from "react"
import { Brain, Filter, LayoutGrid, List } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { Chip, memoryTypeVariant } from "@/components/ui/chip"
import { MemoryCard, type Memory } from "@/components/app/memory-card"
import { EmptyState } from "@/components/ui/empty-state"
import { MemoryCardSkeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

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
    <div className="flex flex-col lg:flex-row gap-6 h-full">
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
          {PRIVACY.filter(p => p !== "all").map((p) => (
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
        </div>

        {loading ? (
          <div className={view === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {[...Array(4)].map((_, i) => <MemoryCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Brain className="h-6 w-6" />}
            title="No memories found"
            description={query ? `No results for "${query}". Try different keywords or remove filters.` : "No memories match the current filters."}
          />
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-3" : "space-y-3"}>
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

      {/* Right: detail panel — sticky side on lg, inline below on mobile */}
      {selectedMemory && (
        <div className="lg:w-80 lg:shrink-0 w-full rounded-[14px] border border-[rgba(173,255,47,0.2)] bg-[#11181C] p-5 h-fit lg:sticky top-6 space-y-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <Chip variant={memoryTypeVariant[selectedMemory.type]} dot>{selectedMemory.type}</Chip>
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
          <div className="text-xs text-[#4B5563] font-mono">by {selectedMemory.author}</div>
        </div>
      )}
    </div>
  )
}
