"use client"

import * as React from "react"
import { FileText, BarChart2, FileArchive, FileOutput, Database, Download, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatBlobId, timeAgo } from "@/lib/utils"
import { Skeleton, ArtifactRowSkeleton } from "@/components/ui/skeleton"

const ARTIFACTS = [
  { id: "art_001", filename: "drift-report-2025-05-19.md", type: "report", size: "4.2 KB", source: "PR Reviewer Agent", blobId: "9rS2tU4vW6xY8zA1bC3dE5fG", relatedMemory: "arch/api-drift-analysis", createdAt: new Date(Date.now() - 2 * 86400000) },
  { id: "art_002", filename: "embeddings-benchmark.json", type: "dataset", size: "128 KB", source: "you", blobId: "7xK2mN9pQ1rS3tU5vW7xY9zA", createdAt: new Date(Date.now() - 4 * 86400000) },
  { id: "art_003", filename: "api-error-log-may18.txt", type: "log", size: "22 KB", source: "PR Reviewer Agent", blobId: "3bC5dE7fG9hI1jK2lM4nO6pQ", createdAt: new Date(Date.now() - 6 * 86400000) },
  { id: "art_004", filename: "memory-usage-report.md", type: "report", size: "8.1 KB", source: "you", blobId: "1jK8lM2nO4pQ6rS0tU2vW4xY", relatedMemory: "decision/storage-strategy", createdAt: new Date(Date.now() - 9 * 86400000) },
]

const typeIcon: Record<string, typeof FileText> = {
  report: FileText,
  dataset: Database,
  log: BarChart2,
  output: FileOutput,
  archive: FileArchive,
}

type TypeKey = "dataset" | "log" | "report" | "output"

const typeChip: Record<TypeKey, { bg: string; text: string }> = {
  dataset: { bg: "rgba(96,165,250,0.1)",  text: "#60A5FA" },
  log:     { bg: "rgba(251,191,36,0.1)",  text: "#FBBF24" },
  report:  { bg: "rgba(173,255,47,0.1)",  text: "#ADFF2F" },
  output:  { bg: "rgba(168,85,247,0.1)",  text: "#A855F7" },
}

function TypeChip({ type }: { type: string }) {
  const style = typeChip[type as TypeKey] ?? { bg: "rgba(255,255,255,0.06)", text: "#8B96A0" }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono"
      style={{ background: style.bg, color: style.text }}
    >
      {type}
    </span>
  )
}

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = React.useState(ARTIFACTS)
  const [viewing, setViewing] = React.useState<typeof ARTIFACTS[0] | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Artifacts</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Files saved by agents and workspace members</p>
      </div>

      {artifacts.length === 0 ? (
        <EmptyState
          image="/empty-artifacts.png"
          title="No artifacts yet"
          description="Artifacts are saved when agents generate reports, datasets, or logs."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div
            className="relative hidden sm:block overflow-hidden"
            style={{
              background: "rgba(17,25,35,0.88)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-[1fr_80px_120px_90px_140px_100px] px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {["File", "Size", "Source", "Saved", "Blob ID", ""].map((col) => (
                <span
                  key={col}
                  className="text-[10px] font-mono uppercase tracking-widest text-[#8B96A0]"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ArtifactRowSkeleton key={i} />)
            ) : artifacts.map(({ id, filename, type, size, source, blobId, relatedMemory, createdAt }) => {
              const Icon = typeIcon[type] ?? FileText
              return (
                <div
                  key={id}
                  className="group grid grid-cols-[1fr_80px_120px_90px_140px_100px] items-center px-4 py-3.5 last:border-0 hover:bg-[rgba(255,255,255,0.025)] transition-colors duration-150"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {/* Filename */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 text-[#8B96A0] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#E8EDF0] truncate">{filename}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <TypeChip type={type} />
                        {relatedMemory && (
                          <span className="text-[10px] font-mono text-[#8B96A0] truncate">
                            → {relatedMemory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <span className="text-xs font-mono text-[#8B96A0]">{size}</span>

                  {/* Source */}
                  <span className="text-xs text-[#8B96A0] truncate pr-2">{source}</span>

                  {/* Saved */}
                  <span className="text-xs font-mono text-[#8B96A0]">{timeAgo(createdAt)}</span>

                  {/* Blob ID */}
                  <span className="text-xs font-mono text-[#8B96A0]">{formatBlobId(blobId)}</span>

                  {/* Actions — fade in on row hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => setViewing({ id, filename, type, size, source, blobId, relatedMemory, createdAt })}
                      className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
                      title="View details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toast.success("Downloading…", { description: filename })}
                      className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#60A5FA] hover:bg-[rgba(96,165,250,0.1)] cursor-pointer"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(id)}
                      className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-[14px] p-4 space-y-3" style={{ background: "rgba(17,25,35,0.88)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 rounded shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : artifacts.map(({ id, filename, type, size, source, blobId, relatedMemory, createdAt }) => {
              const Icon = typeIcon[type] ?? FileText
              return (
                <div
                  key={id}
                  className="rounded-[14px] p-4 space-y-3"
                  style={{
                    background: "rgba(17,25,35,0.88)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-[#8B96A0] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#E8EDF0] truncate">{filename}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <TypeChip type={type} />
                        <span className="text-[10px] font-mono text-[#8B96A0]">{size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewing({ id, filename, type, size, source, blobId, relatedMemory, createdAt })}
                        className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toast.success("Downloading…", { description: filename })}
                        className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#60A5FA] hover:bg-[rgba(96,165,250,0.1)] cursor-pointer"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(id)}
                        className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.1)] cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between text-[10px] font-mono text-[#8B96A0] pt-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span>{source}</span>
                    <span>{timeAgo(createdAt)}</span>
                    <span className="truncate ml-2 max-w-[120px]">{formatBlobId(blobId)}</span>
                  </div>
                  {relatedMemory && (
                    <p className="text-[10px] font-mono text-[#8B96A0]">→ {relatedMemory}</p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.filename}</DialogTitle>
            <DialogDescription>Artifact metadata stored on Walrus.</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 font-mono text-xs">
              {([
                ["Type", viewing.type],
                ["Size", viewing.size],
                ["Source", viewing.source],
                ["Walrus Blob", viewing.blobId],
                ...(viewing.relatedMemory ? [["Related memory", viewing.relatedMemory]] : []),
              ] as Array<[string, string]>).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between gap-x-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#8B96A0]">{k}</span>
                  <span className="text-[#E8EDF0] break-all sm:text-right">{v}</span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setViewing(null)}>Close</Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (viewing) toast.success("Downloading…", { description: viewing.filename })
              setViewing(null)
            }}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete this artifact?"
        description="The blob will be removed from Walrus and the file will no longer be accessible."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deletingId) {
            setArtifacts((prev) => prev.filter((a) => a.id !== deletingId))
            toast.success("Artifact deleted")
          }
          setDeletingId(null)
        }}
      />
    </div>
  )
}
