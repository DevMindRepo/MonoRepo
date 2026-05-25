"use client"

import { useQuery } from "@tanstack/react-query"
import { Brain, CheckCircle, Clock, HardDrive, ArrowUpRight, Bot, UserPlus, Save } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { timeAgo } from "@/lib/utils"
import { statsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import type { ActivityEvent, MemoryType } from "@/lib/api-types"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

const activityIcon: Record<ActivityEvent["type"], { icon: typeof Save; cls: string }> = {
  memory_saved: { icon: Save, cls: "text-[#ADFF2F] bg-[rgba(173,255,47,0.1)]" },
  agent_run: { icon: Bot, cls: "text-[#60A5FA] bg-[rgba(96,165,250,0.1)]" },
  member_joined: { icon: UserPlus, cls: "text-[#F472B6] bg-[rgba(244,114,182,0.1)]" },
}

export default function DashboardPage() {
  const workspace = useAuthStore((s) => s.workspace)
  const workspaceId = workspace?.id

  const stats = useQuery({
    queryKey: ["stats", workspaceId],
    queryFn: () => statsApi.workspace(workspaceId!),
    enabled: !!workspaceId,
  })

  const activity = useQuery({
    queryKey: ["activity", workspaceId],
    queryFn: () => statsApi.activity(workspaceId!, 20),
    enabled: !!workspaceId,
  })

  const metrics = stats.data
    ? [
        {
          icon: Brain,
          label: "Total Memories",
          value: String(stats.data.totalMemories),
          change: `+${stats.data.memoriesThisWeek} this week`,
          color: "text-[#ADFF2F]",
          bg: "bg-[rgba(173,255,47,0.08)]",
        },
        {
          icon: CheckCircle,
          label: "Pending Approval",
          value: String(stats.data.pendingCount),
          change: stats.data.pendingCount > 0 ? "review now" : "all clear",
          color: "text-[#F472B6]",
          bg: "bg-[rgba(244,114,182,0.08)]",
          alert: stats.data.pendingCount > 0,
        },
        {
          icon: Clock,
          label: "Agent Runs",
          value: String(stats.data.agentRunsTotal),
          change: `${stats.data.agentRunsThisWeek} this week`,
          color: "text-[#60A5FA]",
          bg: "bg-[rgba(96,165,250,0.08)]",
        },
        {
          icon: HardDrive,
          label: "Walrus Storage",
          value: formatBytes(stats.data.walrusStorageBytes),
          change: `across ${stats.data.artifactsCount} blobs`,
          color: "text-[#FBBF24]",
          bg: "bg-[rgba(251,191,36,0.08)]",
        },
      ]
    : []

  const typeChips: { type: MemoryType; variant: "mint" | "blue" | "red" | "default" }[] = [
    { type: "decision", variant: "mint" },
    { type: "arch", variant: "blue" },
    { type: "bug", variant: "red" },
    { type: "note", variant: "default" },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-[#E8EDF0]">Overview</h1>
        <p className="text-sm text-[#8B96A0] mt-0.5">Your workspace at a glance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C] p-4 space-y-3">
                <Skeleton className="h-9 w-9 rounded-[10px]" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          : metrics.map(({ icon: Icon, label, value, change, color, bg, alert }) => (
              <div
                key={label}
                className={`rounded-[14px] border bg-[#11181C] p-4 space-y-3 ${alert ? "border-[rgba(244,114,182,0.2)]" : "border-[rgba(255,255,255,0.06)]"}`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${bg} ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#E8EDF0] tracking-tight">{value}</div>
                  <div className="text-xs text-[#8B96A0]">{label}</div>
                </div>
                <div className={`text-xs font-mono ${alert ? "text-[#F472B6]" : "text-[#4B5563]"}`}>
                  {change}
                  {alert && <ArrowUpRight className="inline h-3 w-3 ml-0.5" />}
                </div>
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2 rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <h2 className="text-sm font-semibold text-[#E8EDF0]">Recent activity</h2>
          </div>

          {activity.isLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-7 w-7 rounded-[8px]" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.data && activity.data.length > 0 ? (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {activity.data.map((event) => {
                const meta = activityIcon[event.type]
                const Icon = meta.icon
                return (
                  <div key={`${event.type}-${event.id}`} className="flex gap-3 px-5 py-3.5">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${meta.cls}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#E8EDF0]">{event.text}</p>
                      <p className="text-xs text-[#8B96A0] truncate">{event.sub}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-[#4B5563]">{timeAgo(event.timestamp)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={<Brain className="h-6 w-6" />}
                title="No activity yet"
                description="Save your first memory via Claude Code or Cursor to see activity here."
              />
            </div>
          )}
        </div>

        {/* Memory health */}
        <div className="rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-[#11181C]">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <h2 className="text-sm font-semibold text-[#E8EDF0]">Memory health</h2>
          </div>
          <div className="p-5 space-y-4">
            {stats.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : stats.data ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8B96A0]">Approved</span>
                    <span className="font-mono text-[#ADFF2F]">{stats.data.totalMemories}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full bg-[#ADFF2F]"
                      style={{
                        width:
                          stats.data.totalMemories + stats.data.pendingCount > 0
                            ? `${(stats.data.totalMemories / (stats.data.totalMemories + stats.data.pendingCount)) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8B96A0]">Pending</span>
                    <span className="font-mono text-[#F472B6]">{stats.data.pendingCount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-full bg-[#F472B6]"
                      style={{
                        width:
                          stats.data.totalMemories + stats.data.pendingCount > 0
                            ? `${(stats.data.pendingCount / (stats.data.totalMemories + stats.data.pendingCount)) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <p className="text-[10px] font-mono text-[#8B96A0] uppercase tracking-wider">By type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {typeChips.map(({ type, variant }) => (
                      <Chip key={type} variant={variant} dot>
                        {type} · {stats.data!.byType[type] ?? 0}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
