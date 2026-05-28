"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, Bot, UserPlus, Save, Activity, Zap, CheckCircle, type LucideIcon } from "lucide-react"
import { MemoryNode, WalrusBlob, AgentBot, SealLock } from "@/components/icons/brand-icons"
import { Chip } from "@/components/ui/chip"
import { timeAgo } from "@/lib/utils"
import { DashboardMetricSkeleton } from "@/components/ui/skeleton"
import { statsApi } from "@/lib/api-endpoints"
import { useAuthStore } from "@/lib/store/auth"
import type { ActivityEvent } from "@/lib/api-types"

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.5)",
} as React.CSSProperties

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

const activityIconFor = (type: ActivityEvent["type"]): LucideIcon => {
  switch (type) {
    case "memory_saved":
      return Save
    case "agent_run":
      return Bot
    case "member_joined":
      return UserPlus
    default:
      return CheckCircle
  }
}

export default function DashboardPage() {
  const workspaceId = useAuthStore((s) => s.workspace?.id)

  const statsQuery = useQuery({
    queryKey: ["stats", workspaceId],
    queryFn: () => statsApi.workspace(workspaceId!),
    enabled: !!workspaceId,
  })

  const activityQuery = useQuery({
    queryKey: ["activity", workspaceId],
    queryFn: () => statsApi.activity(workspaceId!, 20),
    enabled: !!workspaceId,
  })

  const stats = statsQuery.data
  const activity = activityQuery.data ?? []
  const loading = statsQuery.isLoading || !stats

  const metrics = React.useMemo(() => {
    if (!stats) return []
    return [
      {
        icon: MemoryNode,
        label: "Total Memories",
        value: String(stats.totalMemories),
        change: `+${stats.memoriesThisWeek} this week`,
        color: "#ADFF2F",
        alert: false,
      },
      {
        icon: SealLock,
        label: "Pending Approval",
        value: String(stats.pendingCount),
        change: stats.pendingCount > 0 ? "review now" : "all clear",
        color: "#F472B6",
        alert: stats.pendingCount > 0,
        href: "/approval-queue",
      },
      {
        icon: AgentBot,
        label: "Agent Runs",
        value: String(stats.agentRunsTotal),
        change: `+${stats.agentRunsThisWeek} this week`,
        color: "#60A5FA",
        alert: false,
      },
      {
        icon: WalrusBlob,
        label: "Walrus Storage",
        value: formatBytes(stats.walrusStorageBytes),
        change: `${stats.artifactsCount} artifacts stored`,
        color: "#FBBF24",
        alert: false,
      },
    ]
  }, [stats])

  const quickActions = [
    {
      label: "Review pending memories",
      tag: stats ? `${stats.pendingCount} waiting` : "—",
      href: "/approval-queue",
      color: "#F472B6",
    },
    {
      label: "Browse all memories",
      tag: stats ? `${stats.totalMemories} total` : "—",
      href: "/memories",
      color: "#60A5FA",
    },
    { label: "Connect new AI tool", tag: "MCP setup", href: "/connect", color: "#ADFF2F" },
  ]

  const approvedCount = stats ? Math.max(stats.totalMemories - stats.pendingCount, 0) : 0
  const totalForHealth = stats ? Math.max(stats.totalMemories, 1) : 1

  return (
    <div className="space-y-5 w-full">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF0]">Overview</h1>
          <p className="mt-0.5 text-sm text-[#8B96A0]">Your workspace at a glance</p>
        </div>
        <div
          className="hidden sm:flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: "rgba(173,255,47,0.06)", border: "1px solid rgba(173,255,47,0.2)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]" style={{ boxShadow: "0 0 8px #ADFF2F" }} />
          <span className="text-xs font-mono text-[#ADFF2F]">MCP Active</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <DashboardMetricSkeleton key={i} />)
        ) : metrics.map(({ icon: Icon, label, value, change, color, alert, href }) => (
          <Link
            key={label}
            href={href ?? "#"}
            className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]${href ? " cursor-pointer" : ""}`}
            style={{
              ...glass,
              ...(alert ? { border: `1px solid ${color}30` } : {}),
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.45 }}
            />
            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top left, rgba(255,255,255,0.03), transparent 65%)" }}
            />
            {/* Label + icon row */}
            <div className="relative flex items-center gap-1.5 mb-4">
              <Icon className="h-3.5 w-3.5 text-[#4B5563]" />
              <span className="text-xs text-[#8B96A0]">{label}</span>
            </div>
            {/* Value */}
            <div className="relative text-[22px] sm:text-[28px] font-bold tracking-tight text-[#E8EDF0] leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</div>
            {/* Change */}
            <div className="relative mt-3 flex items-center gap-1">
              <span className="text-[11px] font-mono leading-tight" style={{ color: alert ? color : "#4B5563" }}>
                {change}
              </span>
              {alert && href && <ArrowUpRight className="h-3 w-3" style={{ color }} />}
            </div>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Activity feed */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl" style={glass}>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-[#8B96A0]" />
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Recent activity</h2>
            </div>
            <Link href="/memories" className="text-xs font-mono text-[#ADFF2F] hover:underline transition-opacity hover:opacity-80">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {activityQuery.isLoading ? (
              <div className="px-5 py-10 text-center text-xs text-[#4B5563]">Loading activity…</div>
            ) : activity.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-[#4B5563]">No recent activity yet.</div>
            ) : (
              activity.map((event) => {
                const Icon = activityIconFor(event.type)
                return (
                  <div key={event.id} className="flex gap-3.5 px-5 py-3.5">
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#8B96A0]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#E8EDF0]">{event.text}</p>
                      <p className="mt-0.5 text-xs text-[#8B96A0] truncate">{event.sub}</p>
                    </div>
                    <span className="mt-0.5 shrink-0 text-[10px] font-mono text-[#4B5563]">{timeAgo(event.timestamp)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Memory health */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <div className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <Zap className="h-4 w-4 text-[#8B96A0]" />
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Memory health</h2>
            </div>
            <div className="space-y-4 p-5">
              {[
                { label: "Approved", value: approvedCount, total: totalForHealth, color: "#ADFF2F", colorFade: "rgba(173,255,47,0.5)" },
                { label: "Pending", value: stats?.pendingCount ?? 0, total: totalForHealth, color: "#F472B6", colorFade: "rgba(244,114,182,0.5)" },
              ].map(({ label, value, total, color, colorFade }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8B96A0]">{label}</span>
                    <span className="font-mono" style={{ color }}>{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max((value / total) * 100, 2)}%`,
                        background: `linear-gradient(90deg, ${color}, ${colorFade})`,
                        boxShadow: `0 0 8px ${color}55`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">By type</p>
                <div className="flex flex-wrap gap-1.5">
                  <Chip variant="mint" dot>decision · {stats?.byType.decision ?? 0}</Chip>
                  <Chip variant="blue" dot>arch · {stats?.byType.arch ?? 0}</Chip>
                  <Chip variant="red" dot>bug · {stats?.byType.bug ?? 0}</Chip>
                  <Chip variant="default" dot>note · {stats?.byType.note ?? 0}</Chip>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Quick actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(({ label, tag, href, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-[#8B96A0] group-hover:text-[#E8EDF0] transition-colors duration-150 truncate">{label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[10px] font-mono" style={{ color }}>{tag}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
