"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Bot, GitPullRequest, Brain, MessageSquare, Save, Clock, ChevronDown, AlertTriangle } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { TimelineEventSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { timeAgo } from "@/lib/utils"
import { agentRunsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { ApiError } from "@/lib/api"
import type { AgentRun } from "@/lib/api-types"

const statusColor: Record<string, string> = {
  completed: "text-[#ADFF2F] bg-[rgba(173,255,47,0.1)]",
  running: "text-[#F472B6] bg-[rgba(244,114,182,0.1)]",
  failed: "text-[#F87171] bg-[rgba(248,113,113,0.1)]",
}

const iconBox = "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
const iconStyle = { background: "rgba(255,255,255,0.04)" }
const iconCls = "h-3.5 w-3.5 text-[#8B96A0]"

function prLabel(run: AgentRun): string {
  if (run.prNumber && run.prTitle) return `#${run.prNumber} — ${run.prTitle}`
  if (run.prNumber) return `#${run.prNumber}`
  if (run.prTitle) return run.prTitle
  return run.agentName
}

function RunCard({ run }: { run: AgentRun }) {
  const [open, setOpen] = React.useState(false)
  const label = prLabel(run)

  return (
    <div
      className="rounded-[14px] overflow-hidden backdrop-blur-xl"
      style={{ background: "rgba(17,25,35,0.88)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 24px rgba(0,0,0,0.4)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-200 text-left"
      >
        <div className={iconBox} style={iconStyle}>
          <Bot className={iconCls} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[#E8EDF0]">{run.agentName}</span>
            <Chip variant="blue" dot><span className="truncate max-w-[160px] sm:max-w-none">{label}</span></Chip>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#8B96A0]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(run.createdAt)}
            </span>
            {run.memoriesQueried.length > 0 && (
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {run.memoriesQueried.length} memories recalled
              </span>
            )}
            {run.durationMs !== null && (
              <span className="hidden sm:inline">{(run.durationMs / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-mono ${statusColor[run.status] ?? "text-[#8B96A0] bg-[rgba(255,255,255,0.04)]"}`}>
          {run.status}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[#8B96A0] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="border-t border-[rgba(255,255,255,0.06)] px-4 sm:px-5 py-4 space-y-4">
          {/* PR */}
          {(run.prNumber || run.prTitle) && (
            <div className="flex items-start gap-3">
              <div className={iconBox} style={iconStyle}>
                <GitPullRequest className={iconCls} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-[#8B96A0]">Pull request</p>
                {run.prUrl ? (
                  <a href={run.prUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#ADFF2F] hover:underline break-words">
                    {label}
                  </a>
                ) : (
                  <p className="text-sm text-[#E8EDF0] break-words">{label}</p>
                )}
              </div>
            </div>
          )}

          {/* Memories */}
          {run.memoriesQueried.length > 0 && (
            <div className="flex items-start gap-3">
              <div className={iconBox} style={iconStyle}>
                <Brain className={iconCls} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-mono text-[#8B96A0]">Memories recalled</p>
                {run.memoriesQueried.map((m) => (
                  <span key={m} className="block text-xs font-mono text-[#ADFF2F] bg-[rgba(173,255,47,0.05)] rounded px-1.5 py-0.5 w-fit max-w-full truncate">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {run.reasoning && (
            <div className="flex items-start gap-3">
              <div className={iconBox} style={iconStyle}>
                <Bot className={iconCls} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-[#8B96A0] mb-1">Reasoning</p>
                <p className="text-xs text-[#8B96A0] leading-relaxed break-words">{run.reasoning}</p>
              </div>
            </div>
          )}

          {/* Comment */}
          {run.comment && (
            <div className="flex items-start gap-3">
              <div className={iconBox} style={iconStyle}>
                <MessageSquare className={iconCls} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-[#8B96A0] mb-1">
                  {run.reviewPosted ? "GitHub comment posted" : "Pending comment"}
                </p>
                <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-xs text-[#E8EDF0] leading-relaxed break-words">
                  {run.comment}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {run.errorMessage && (
            <div className="flex items-start gap-3">
              <div className={iconBox} style={iconStyle}>
                <AlertTriangle className="h-3.5 w-3.5 text-[#F87171]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono text-[#F87171] mb-1">Error</p>
                <p className="text-xs text-[#F87171] leading-relaxed break-words">{run.errorMessage}</p>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex items-start gap-3">
            <div className={iconBox} style={iconStyle}>
              <Save className={iconCls} />
            </div>
            <p className="text-xs text-[#4B5563] mt-1.5 min-w-0 flex-1">
              {run.reviewPosted ? "Reasoning saved to DevMind → pending approval" : "Run logged"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgentTimelinePage() {
  const workspaceId = useAuthStore((s) => s.workspace?.id)

  const runsQuery = useQuery({
    queryKey: ["agent-runs", workspaceId],
    queryFn: () => agentRunsApi.list(workspaceId!, 50),
    enabled: !!workspaceId,
  })

  const runs = runsQuery.data ?? []
  const loading = runsQuery.isLoading

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Agent Timeline</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Autonomous agent execution history</p>
      </div>

      {runsQuery.error && (
        <p className="text-xs text-[#F87171]">
          Failed to load agent runs: {runsQuery.error instanceof ApiError ? runsQuery.error.message : "Network error"}
        </p>
      )}

      {loading ? (
        <div className="space-y-2 rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.06)]" style={{ background: "rgba(17,25,35,0.88)" }}>
          {Array.from({ length: 4 }).map((_, i) => <TimelineEventSkeleton key={i} />)}
        </div>
      ) : runs.length === 0 ? (
        <EmptyState
          image="/empty-timeline.png"
          title="No agent runs yet"
          description="Agent runs will appear here once your PR Reviewer processes a pull request."
        />
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  )
}
