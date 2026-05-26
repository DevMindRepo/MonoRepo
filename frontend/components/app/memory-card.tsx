"use client"

import * as React from "react"
import { ExternalLink, Lock, Users, Globe, Clock } from "lucide-react"
import { Chip, memoryTypeVariant, privacyVariant } from "@/components/ui/chip"
import { cn, formatBlobId, timeAgo } from "@/lib/utils"

export interface Memory {
  id: string
  content: string
  type: "decision" | "bug" | "arch" | "note"
  privacy: "private" | "team" | "public"
  tags: string[]
  author: string
  createdAt: string | Date
  blobId?: string
  workspaceName?: string
}

interface MemoryCardProps {
  memory: Memory
  onClick?: () => void
  selected?: boolean
  className?: string
}

const privacyIcon = {
  private: Lock,
  team: Users,
  public: Globe,
}

export function MemoryCard({ memory, onClick, selected, className }: MemoryCardProps) {
  const PrivacyIcon = privacyIcon[memory.privacy]
  const preview = memory.content.slice(0, 140) + (memory.content.length > 140 ? "…" : "")

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-[14px] border backdrop-blur-xl p-4 transition-all duration-200",
        "hover:border-[rgba(173,255,47,0.2)]",
        selected
          ? "border-[rgba(173,255,47,0.35)] shadow-[0_0_0_1px_rgba(173,255,47,0.15)]"
          : "border-[rgba(255,255,255,0.09)]",
        className
      )}
      style={{ background: "rgba(17,25,35,0.88)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Chip variant={memoryTypeVariant[memory.type]} dot>
            {memory.type}
          </Chip>
          <Chip variant={privacyVariant[memory.privacy]}>
            <PrivacyIcon className="h-2.5 w-2.5" />
            {memory.privacy}
          </Chip>
        </div>
        {memory.blobId && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#4B5563] group-hover:text-[#8B96A0] transition-colors duration-200 shrink-0">
            <ExternalLink className="h-2.5 w-2.5" />
            {formatBlobId(memory.blobId)}
          </span>
        )}
      </div>

      <p className="text-sm text-[#E8EDF0] leading-relaxed mb-3 line-clamp-2">
        {preview}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {memory.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono text-[#4B5563] bg-[rgba(255,255,255,0.04)] rounded px-1.5 py-0.5"
          >
            #{tag}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-1 text-[11px] text-[#4B5563]">
          <Clock className="h-3 w-3" />
          {timeAgo(memory.createdAt)}
        </div>
      </div>
    </button>
  )
}
