import { Package, FileText, Database, BarChart2, Download, ExternalLink } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { formatBlobId, timeAgo } from "@/lib/utils"

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
  output: Package,
}

const typeVariant: Record<string, "mint" | "blue" | "yellow" | "default"> = {
  report: "mint",
  dataset: "blue",
  log: "yellow",
  output: "default",
}

export default function ArtifactsPage() {
  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Artifacts</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Files saved by agents and workspace members</p>
      </div>

      {ARTIFACTS.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No artifacts yet"
          description="Artifacts are saved when agents generate reports, datasets, or logs."
        />
      ) : (
        <>
        {/* Desktop table */}
        <div className="hidden sm:block rounded-[14px] overflow-hidden backdrop-blur-xl" style={{ background: "rgba(17,25,35,0.88)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 24px rgba(0,0,0,0.4)" }}>
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[rgba(255,255,255,0.06)] text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">
            <span>File</span>
            <span>Size</span>
            <span>Source</span>
            <span className="hidden md:block">Blob ID</span>
            <span />
          </div>

          {ARTIFACTS.map(({ id, filename, type, size, source, blobId, relatedMemory }) => {
            const Icon = typeIcon[type] ?? FileText
            return (
              <div
                key={id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-[8px] bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#8B96A0] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#E8EDF0] font-mono truncate">{filename}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Chip variant={typeVariant[type]}>{type}</Chip>
                      {relatedMemory && (
                        <span className="text-[10px] font-mono text-[#4B5563] truncate">→ {relatedMemory}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#8B96A0] shrink-0">{size}</span>
                <span className="text-xs text-[#8B96A0] shrink-0">{source}</span>
                <span className="hidden md:block text-xs font-mono text-[#4B5563] shrink-0">
                  {formatBlobId(blobId)}
                </span>
                <div className="flex items-center gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4B5563] hover:text-[#ADFF2F] hover:bg-[rgba(173,255,47,0.08)] transition-all duration-150 cursor-pointer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4B5563] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150 cursor-pointer">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {ARTIFACTS.map(({ id, filename, type, size, source, blobId, relatedMemory }) => {
            const Icon = typeIcon[type] ?? FileText
            return (
              <div
                key={id}
                className="rounded-[14px] backdrop-blur-xl p-4 space-y-3" style={{ background: "rgba(17,25,35,0.88)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-[8px] bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#8B96A0] shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E8EDF0] font-mono truncate">{filename}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Chip variant={typeVariant[type]}>{type}</Chip>
                      <span className="text-[10px] font-mono text-[#8B96A0]">{size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4B5563] hover:text-[#ADFF2F] hover:bg-[rgba(173,255,47,0.08)] transition-all duration-150 cursor-pointer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4B5563] hover:text-[#E8EDF0] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#4B5563] pt-1 border-t border-[rgba(255,255,255,0.04)]">
                  <span>{source}</span>
                  <span className="truncate ml-2 max-w-[120px]">{formatBlobId(blobId)}</span>
                </div>
                {relatedMemory && (
                  <p className="text-[10px] font-mono text-[#4B5563]">→ {relatedMemory}</p>
                )}
              </div>
            )
          })}
        </div>
        </>
      )}
    </div>
  )
}
