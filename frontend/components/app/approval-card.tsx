"use client"

import * as React from "react"
import { Check, Pencil, X, AlertTriangle, Bot, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip, memoryTypeVariant } from "@/components/ui/chip"
import { cn, timeAgo } from "@/lib/utils"

export interface PendingMemory {
  id: string
  content: string
  type: "decision" | "bug" | "arch" | "note"
  tags: string[]
  source: string
  sessionId: string
  workspaceName: string
  createdAt: string | Date
  secrets?: { pattern: string; index: number; length: number }[]
}

interface ApprovalCardProps {
  memory: PendingMemory
  onApprove: (id: string) => void
  onEdit: (id: string) => void
  onReject: (id: string) => void
  loading?: boolean
  className?: string
}

function highlightSecrets(
  content: string,
  secrets: PendingMemory["secrets"] = []
): React.ReactNode {
  if (!secrets.length) return content

  const parts: React.ReactNode[] = []
  let last = 0

  const sorted = [...secrets].sort((a, b) => a.index - b.index)

  for (const s of sorted) {
    if (s.index > last) {
      parts.push(content.slice(last, s.index))
    }
    parts.push(
      <span
        key={s.index}
        title={`Possible secret: ${s.pattern} — review before approving`}
        className="relative cursor-help"
      >
        <span className="bg-[rgba(244,114,182,0.15)] text-[#F472B6] rounded px-0.5 underline decoration-[#F472B6] decoration-wavy underline-offset-2">
          {content.slice(s.index, s.index + s.length)}
        </span>
      </span>
    )
    last = s.index + s.length
  }

  if (last < content.length) {
    parts.push(content.slice(last))
  }

  return <>{parts}</>
}

export function ApprovalCard({
  memory,
  onApprove,
  onEdit,
  onReject,
  loading,
  className,
}: ApprovalCardProps) {
  const hasSecrets = (memory.secrets?.length ?? 0) > 0

  return (
    <div
      className={cn(
        "rounded-[14px] border border-[rgba(255,255,255,0.09)] overflow-hidden backdrop-blur-xl",
        "transition-all duration-200 hover:border-[rgba(255,255,255,0.14)]",
        hasSecrets && "border-[rgba(244,114,182,0.22)] hover:border-[rgba(244,114,182,0.3)]",
        className
      )}
      style={{ background: "rgba(17,25,35,0.88)", boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.45)" }}
    >
      {hasSecrets && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(244,114,182,0.06)] border-b border-[rgba(244,114,182,0.15)]">
          <AlertTriangle className="h-3.5 w-3.5 text-[#F472B6] shrink-0" />
          <p className="text-xs text-[#F472B6]">
            Possible secrets detected — review highlighted content before approving
          </p>
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <Chip variant={memoryTypeVariant[memory.type]} dot>
            {memory.type}
          </Chip>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#8B96A0]">
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3 shrink-0" />
              {memory.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {timeAgo(memory.createdAt)}
            </span>
          </div>
        </div>

        <div className="rounded-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)] p-4 mb-4">
          <pre className="text-sm text-[#E8EDF0] font-sans leading-relaxed whitespace-pre-wrap break-words">
            {highlightSecrets(memory.content, memory.secrets)}
          </pre>
        </div>

        {memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-[#ADFF2F] rounded px-1.5 py-0.5"
                style={{ background: "rgba(173,255,47,0.08)", border: "1px solid rgba(173,255,47,0.18)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(memory.id)}
            loading={loading}
            className="gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(memory.id)}
            disabled={loading}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(memory.id)}
            disabled={loading}
            className="sm:ml-auto gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}
