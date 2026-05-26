import { Bot, GitPullRequest, Brain, MessageSquare, Save, Clock } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"

const RUNS = [
  {
    id: "run_001",
    pr: "#249 — feat: add rate limiting to /api/memories",
    status: "completed",
    time: "2h ago",
    memoriesQueried: ["decision/api-rate-limits", "arch/fastify-plugins"],
    reviewPosted: true,
    reasoning: "PR introduces rate limiting via fastify-rate-limit. Found memory decision/api-rate-limits which specifies we use Redis-based rate limiting with 60 req/min per workspace. PR uses in-memory limiter — flagged as inconsistent with our decision.",
    comment: "⚠ Rate limiting here uses in-memory storage, but arch/api-rate-limits (DevMind) specifies Redis-backed rate limiting for consistency across instances. Consider @fastify/rate-limit with Redis store.",
  },
  {
    id: "run_002",
    pr: "#248 — fix: remove console.log from auth middleware",
    status: "completed",
    time: "5h ago",
    memoriesQueried: [],
    reviewPosted: true,
    reasoning: "No relevant memories found. PR is a simple cleanup — approved with no comments.",
    comment: "LGTM — straightforward cleanup, no issues found.",
  },
  {
    id: "run_003",
    pr: "#247 — feat: switch auth from JWT to sessions",
    status: "completed",
    time: "1d ago",
    memoriesQueried: ["decision/auth-2024-11-15", "arch/stateless-api"],
    reviewPosted: true,
    reasoning: "Found decision/auth-2024-11-15 which explicitly chose JWT for stateless scalability. This PR introduces session tokens which would require Redis dependency — contradicts the prior decision.",
    comment: "⚠ This PR contradicts decision/auth-2024-11-15 (DevMind): JWT was chosen for stateless scalability; sessions require Redis session store. Please review the linked memory and discuss with the team before merging.",
  },
]

const statusColor: Record<string, string> = {
  completed: "text-[#ADFF2F] bg-[rgba(173,255,47,0.1)]",
  running: "text-[#F472B6] bg-[rgba(244,114,182,0.1)]",
  failed: "text-[#F87171] bg-[rgba(248,113,113,0.1)]",
}

export default function AgentTimelinePage() {
  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Agent Timeline</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Autonomous agent execution history</p>
      </div>

      <div className="space-y-4">
        {RUNS.map((run) => (
          <details key={run.id} className="group rounded-[14px] overflow-hidden backdrop-blur-xl" style={{ background: "rgba(17,25,35,0.88)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 24px rgba(0,0,0,0.4)" }}>
            <summary className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-4 cursor-pointer list-none hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[rgba(96,165,250,0.1)] text-[#60A5FA] shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[#E8EDF0]">PR Reviewer</span>
                  <Chip variant="blue" dot><span className="truncate max-w-[160px] sm:max-w-none">{run.pr}</span></Chip>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#8B96A0]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {run.time}
                  </span>
                  {run.memoriesQueried.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {run.memoriesQueried.length} memories recalled
                    </span>
                  )}
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-mono ${statusColor[run.status]}`}>
                {run.status}
              </span>
            </summary>

            <div className="border-t border-[rgba(255,255,255,0.06)] px-4 sm:px-5 py-4 space-y-4">
              {/* PR */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(96,165,250,0.1)] text-[#60A5FA] shrink-0">
                  <GitPullRequest className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#8B96A0]">Pull request</p>
                  <p className="text-sm text-[#E8EDF0]">{run.pr}</p>
                </div>
              </div>

              {/* Memories */}
              {run.memoriesQueried.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(173,255,47,0.1)] text-[#ADFF2F] shrink-0">
                    <Brain className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-[#8B96A0]">Memories recalled</p>
                    {run.memoriesQueried.map((m) => (
                      <span key={m} className="block text-xs font-mono text-[#ADFF2F] bg-[rgba(173,255,47,0.05)] rounded px-1.5 py-0.5 w-fit">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(251,191,36,0.1)] text-[#FBBF24] shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#8B96A0] mb-1">Reasoning</p>
                  <p className="text-xs text-[#8B96A0] leading-relaxed">{run.reasoning}</p>
                </div>
              </div>

              {/* Comment */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(244,114,182,0.1)] text-[#F472B6] shrink-0">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#8B96A0] mb-1">GitHub comment posted</p>
                  <div className="rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-xs text-[#E8EDF0] leading-relaxed">
                    {run.comment}
                  </div>
                </div>
              </div>

              {/* Save artifact */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(255,255,255,0.06)] text-[#4B5563] shrink-0">
                  <Save className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs text-[#4B5563] mt-1.5">Reasoning saved to DevMind → pending approval</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
