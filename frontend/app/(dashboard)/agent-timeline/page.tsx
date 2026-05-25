"use client"

import { useQuery } from "@tanstack/react-query"
import { Bot, GitPullRequest, Brain, MessageSquare, Clock, ExternalLink } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { agentRunsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import { timeAgo } from "@/lib/utils"
import type { AgentRun } from "@/lib/api-types"

const statusColor: Record<AgentRun["status"], string> = {
  completed: "text-[#ADFF2F] bg-[rgba(173,255,47,0.1)]",
  running: "text-[#F472B6] bg-[rgba(244,114,182,0.1)]",
  failed: "text-[#F87171] bg-[rgba(248,113,113,0.1)]",
}

export default function AgentTimelinePage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id

  const { data: runs, isLoading } = useQuery({
    queryKey: ["agent-runs", workspaceId],
    queryFn: () => agentRunsApi.list(workspaceId!),
    enabled: !!workspaceId,
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Agent Timeline</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Autonomous agent execution history</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-[8px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : !runs || runs.length === 0 ? (
        <EmptyState
          icon={<Bot className="h-6 w-6" />}
          title="No agent runs yet"
          description="When the PR Reviewer Agent reviews a pull request, its execution will appear here."
        />
      ) : (
        <div className="space-y-4">
          {runs.map((run) => {
            const prLabel = run.prNumber
              ? `#${run.prNumber}${run.prTitle ? ` — ${run.prTitle}` : ""}`
              : run.agentName
            return (
              <details
                key={run.id}
                className="group rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] overflow-hidden"
              >
                <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[rgba(96,165,250,0.1)] text-[#60A5FA] shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#E8EDF0] capitalize">{run.agentName.replace("-", " ")}</span>
                      <Chip variant="blue" dot>{prLabel}</Chip>
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
                        <span className="font-mono">{run.durationMs}ms</span>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-mono ${statusColor[run.status]}`}>
                    {run.status}
                  </span>
                </summary>

                <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-4 space-y-4">
                  {/* PR link */}
                  {run.prUrl && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(96,165,250,0.1)] text-[#60A5FA] shrink-0">
                        <GitPullRequest className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono text-[#8B96A0]">Pull request</p>
                        <a
                          href={run.prUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[#E8EDF0] hover:text-[#ADFF2F] inline-flex items-center gap-1 transition-colors duration-150"
                        >
                          {prLabel}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Memories */}
                  {run.memoriesQueried.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(173,255,47,0.1)] text-[#ADFF2F] shrink-0">
                        <Brain className="h-3.5 w-3.5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs font-mono text-[#8B96A0]">Memories recalled</p>
                        {run.memoriesQueried.map((m) => (
                          <span
                            key={m}
                            className="block text-xs font-mono text-[#ADFF2F] bg-[rgba(173,255,47,0.05)] rounded px-1.5 py-0.5 w-fit truncate max-w-full"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasoning */}
                  {run.reasoning && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(251,191,36,0.1)] text-[#FBBF24] shrink-0">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono text-[#8B96A0] mb-1">Reasoning</p>
                        <p className="text-xs text-[#8B96A0] leading-relaxed whitespace-pre-wrap">{run.reasoning}</p>
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  {run.comment && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(244,114,182,0.1)] text-[#F472B6] shrink-0">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono text-[#8B96A0] mb-1">
                          {run.reviewPosted ? "GitHub comment posted" : "Proposed comment"}
                        </p>
                        <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-xs text-[#E8EDF0] leading-relaxed whitespace-pre-wrap">
                          {run.comment}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {run.errorMessage && (
                    <div className="rounded-[10px] border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.05)] px-3 py-2.5 text-xs text-[#F87171] font-mono">
                      Error: {run.errorMessage}
                    </div>
                  )}
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
