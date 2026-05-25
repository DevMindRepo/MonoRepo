"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Package, FileText, Database, BarChart2, Download, ExternalLink, Loader2 } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBlobId, timeAgo } from "@/lib/utils"
import { artifactsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { env } from "@/lib/env"
import { ApiError } from "@/lib/api"
import type { ArtifactType } from "@/lib/api-types"

const typeIcon: Record<ArtifactType, typeof FileText> = {
  report: FileText,
  dataset: Database,
  log: BarChart2,
  output: Package,
}

const typeVariant: Record<ArtifactType, "mint" | "blue" | "yellow" | "default"> = {
  report: "mint",
  dataset: "blue",
  log: "yellow",
  output: "default",
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export default function ArtifactsPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null)

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["artifacts", workspaceId],
    queryFn: () => artifactsApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  async function handleDownload(id: string, filename: string) {
    setDownloadingId(id)
    try {
      const result = await artifactsApi.get(id)
      const binary = atob(result.contentBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes])
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${filename}`)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Download failed"
      toast.error(message)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Artifacts</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Files saved by agents and workspace members</p>
      </div>

      {isLoading ? (
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[8px]" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : !artifacts || artifacts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No artifacts yet"
          description="Artifacts are saved when agents generate reports, datasets, or logs."
        />
      ) : (
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[rgba(255,255,255,0.06)] text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">
            <span>File</span>
            <span>Size</span>
            <span className="hidden sm:block">Source</span>
            <span className="hidden md:block">Blob ID</span>
            <span />
          </div>

          {artifacts.map((a) => {
            const Icon = typeIcon[a.type] ?? FileText
            return (
              <div
                key={a.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-[8px] bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#8B96A0] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#E8EDF0] font-mono truncate">{a.filename}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Chip variant={typeVariant[a.type]}>{a.type}</Chip>
                      <span className="text-[10px] font-mono text-[#4B5563]">{timeAgo(a.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono text-[#8B96A0] shrink-0">{formatBytes(a.sizeBytes)}</span>

                <span className="hidden sm:block text-xs text-[#8B96A0] shrink-0 truncate max-w-[120px]">
                  {a.source ?? a.author.displayName ?? a.author.suiAddress.slice(0, 8)}
                </span>

                <span className="hidden md:block text-xs font-mono text-[#4B5563] shrink-0">
                  {formatBlobId(a.blobId)}
                </span>

                <div className="flex items-center gap-1">
                  <a
                    href={`${env.NEXT_PUBLIC_WALRUS_AGGREGATOR}/v1/blobs/${a.blobId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4B5563] hover:text-[#ADFF2F] hover:bg-[rgba(173,255,47,0.08)] transition-all duration-150 cursor-pointer"
                    title="View on Walrus aggregator"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDownload(a.id, a.filename)}
                    disabled={downloadingId === a.id}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4B5563] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150 cursor-pointer disabled:opacity-50"
                    title="Download"
                  >
                    {downloadingId === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
