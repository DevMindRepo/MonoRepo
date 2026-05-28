"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, BarChart2, FileArchive, FileOutput, Database, Download, Eye, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatBlobId, timeAgo } from "@/lib/utils"
import { Skeleton, ArtifactRowSkeleton } from "@/components/ui/skeleton"
import { artifactsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { ApiError } from "@/lib/api"
import { env } from "@/lib/env"
import type { Artifact } from "@/lib/api-types"

const typeIcon: Record<string, typeof FileText> = {
  report: FileText,
  dataset: Database,
  log: BarChart2,
  output: FileOutput,
  archive: FileArchive,
}

type TypeKey = "dataset" | "log" | "report" | "output"

const typeChip: Record<TypeKey, { bg: string; text: string }> = {
  dataset: { bg: "rgba(96,165,250,0.1)", text: "#60A5FA" },
  log: { bg: "rgba(251,191,36,0.1)", text: "#FBBF24" },
  report: { bg: "rgba(173,255,47,0.1)", text: "#ADFF2F" },
  output: { bg: "rgba(168,85,247,0.1)", text: "#A855F7" },
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

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`
}

function base64ToBlob(base64: string, _filename: string): Blob {
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i)
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray])
}

export default function ArtifactsPage() {
  const workspaceId = useAuthStore((s) => s.workspace?.id)
  const [viewing, setViewing] = React.useState<Artifact | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)

  const artifactsQuery = useQuery({
    queryKey: ["artifacts", workspaceId],
    queryFn: () => artifactsApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  const artifacts = artifactsQuery.data ?? []
  const loading = artifactsQuery.isLoading

  const handleDownload = async (artifact: Artifact) => {
    setDownloadingId(artifact.id)
    try {
      const result = await artifactsApi.get(artifact.id)
      const blob = base64ToBlob(result.contentBase64, result.filename)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Downloaded", { description: result.filename })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Download failed")
    } finally {
      setDownloadingId(null)
    }
  }

  const walrusUrl = (blobId: string) => `${env.NEXT_PUBLIC_WALRUS_AGGREGATOR}/v1/blobs/${blobId}`

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Artifacts</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Files saved by agents and workspace members</p>
      </div>

      {artifactsQuery.error && (
        <p className="text-xs text-[#F87171]">
          Failed to load artifacts: {artifactsQuery.error instanceof ApiError ? artifactsQuery.error.message : "Network error"}
        </p>
      )}

      {!loading && artifacts.length === 0 ? (
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
            ) : artifacts.map((artifact) => {
              const { id, filename, type, sizeBytes, source, blobId, relatedMemoryId, createdAt } = artifact
              const Icon = typeIcon[type] ?? FileText
              const isDownloading = downloadingId === id
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
                        {relatedMemoryId && (
                          <span className="text-[10px] font-mono text-[#8B96A0] truncate">
                            → {relatedMemoryId.slice(0, 12)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <span className="text-xs font-mono text-[#8B96A0]">{formatBytes(sizeBytes)}</span>

                  {/* Source */}
                  <span className="text-xs text-[#8B96A0] truncate pr-2">{source ?? "—"}</span>

                  {/* Saved */}
                  <span className="text-xs font-mono text-[#8B96A0]">{timeAgo(createdAt)}</span>

                  {/* Blob ID */}
                  <a
                    href={walrusUrl(blobId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#8B96A0] hover:text-[#ADFF2F] inline-flex items-center gap-1 truncate"
                    title="View on Walrus"
                  >
                    {formatBlobId(blobId)}
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                  </a>

                  {/* Actions — fade in on row hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => setViewing(artifact)}
                      className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
                      title="View details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(artifact)}
                      disabled={isDownloading}
                      className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#60A5FA] hover:bg-[rgba(96,165,250,0.1)] cursor-pointer disabled:opacity-50"
                      title="Download"
                    >
                      {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
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
            ) : artifacts.map((artifact) => {
              const { id, filename, type, sizeBytes, source, blobId, relatedMemoryId, createdAt } = artifact
              const Icon = typeIcon[type] ?? FileText
              const isDownloading = downloadingId === id
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
                        <span className="text-[10px] font-mono text-[#8B96A0]">{formatBytes(sizeBytes)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewing(artifact)}
                        className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.08)] cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(artifact)}
                        disabled={isDownloading}
                        className="h-7 w-7 rounded-[8px] flex items-center justify-center transition-all duration-150 text-[#8B96A0] hover:text-[#60A5FA] hover:bg-[rgba(96,165,250,0.1)] cursor-pointer disabled:opacity-50"
                        title="Download"
                      >
                        {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
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
                    <span>{source ?? "—"}</span>
                    <span>{timeAgo(createdAt)}</span>
                    <a href={walrusUrl(blobId)} target="_blank" rel="noopener noreferrer" className="truncate ml-2 max-w-[120px] hover:text-[#ADFF2F]">
                      {formatBlobId(blobId)}
                    </a>
                  </div>
                  {relatedMemoryId && (
                    <p className="text-[10px] font-mono text-[#8B96A0]">→ {relatedMemoryId.slice(0, 16)}</p>
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
                ["Size", formatBytes(viewing.sizeBytes)],
                ["Source", viewing.source ?? "—"],
                ["Walrus Blob", viewing.blobId],
                ...(viewing.relatedMemoryId ? [["Related memory", viewing.relatedMemoryId]] : []),
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
              if (viewing) handleDownload(viewing)
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
          // Backend does not expose DELETE for artifacts yet.
          toast.info("Coming soon", { description: "Artifact delete is not yet supported" })
          setDeletingId(null)
        }}
      />
    </div>
  )
}
