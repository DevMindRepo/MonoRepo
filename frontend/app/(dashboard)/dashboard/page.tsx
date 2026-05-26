"use client"

import Link from "next/link"
import { Brain, CheckCircle, Clock, HardDrive, ArrowUpRight, Bot, UserPlus, Save, Activity, Zap } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { timeAgo } from "@/lib/utils"

const METRICS = [
  {
    icon: Brain,
    label: "Total Memories",
    value: "247",
    change: "+12 this week",
    color: "#ADFF2F",
    colorBg: "rgba(173,255,47,0.08)",
    colorBorder: "rgba(173,255,47,0.18)",
    alert: false,
  },
  {
    icon: CheckCircle,
    label: "Pending Approval",
    value: "3",
    change: "review now",
    color: "#F472B6",
    colorBg: "rgba(244,114,182,0.08)",
    colorBorder: "rgba(244,114,182,0.25)",
    alert: true,
    href: "/approval-queue",
  },
  {
    icon: Clock,
    label: "Agent Runs",
    value: "18",
    change: "this week",
    color: "#60A5FA",
    colorBg: "rgba(96,165,250,0.08)",
    colorBorder: "rgba(96,165,250,0.18)",
    alert: false,
  },
  {
    icon: HardDrive,
    label: "Walrus Storage",
    value: "4.2 MB",
    change: "247 blobs stored",
    color: "#FBBF24",
    colorBg: "rgba(251,191,36,0.08)",
    colorBorder: "rgba(251,191,36,0.18)",
    alert: false,
  },
]

const ACTIVITY = [
  { icon: Save, text: "Memory saved via Claude Code", sub: "decision: use pgvector for semantic search", time: new Date(Date.now() - 12 * 60000), type: "save" },
  { icon: Bot, text: "PR Reviewer reviewed #249", sub: "Referenced 2 memories — auth-policy, api-versioning", time: new Date(Date.now() - 45 * 60000), type: "agent" },
  { icon: CheckCircle, text: "3 memories approved", sub: "arch/db-schema, bug/hydration-mismatch, note/deploy-steps", time: new Date(Date.now() - 2 * 3600000), type: "approve" },
  { icon: UserPlus, text: "alisa@example.com joined workspace", sub: "Invited via Sui address 0x4f2a…", time: new Date(Date.now() - 5 * 3600000), type: "member" },
  { icon: Save, text: "Memory saved via Cursor", sub: "bug: React 19 hydration with Zustand SSR", time: new Date(Date.now() - 8 * 3600000), type: "save" },
]

const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  save:    { color: "#ADFF2F", bg: "rgba(173,255,47,0.08)",   border: "rgba(173,255,47,0.15)" },
  agent:   { color: "#60A5FA", bg: "rgba(96,165,250,0.08)",   border: "rgba(96,165,250,0.15)" },
  approve: { color: "#FBBF24", bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.15)" },
  member:  { color: "#F472B6", bg: "rgba(244,114,182,0.08)",  border: "rgba(244,114,182,0.15)" },
}

const QUICK_ACTIONS = [
  { label: "Review pending memories", tag: "3 waiting", href: "/approval-queue", color: "#F472B6", bg: "rgba(244,114,182,0.08)" },
  { label: "Browse all memories", tag: "247 total", href: "/memories", color: "#60A5FA", bg: "rgba(96,165,250,0.08)" },
  { label: "Connect new AI tool", tag: "MCP setup", href: "/connect", color: "#ADFF2F", bg: "rgba(173,255,47,0.08)" },
]

const glass = {
  background: "rgba(17,25,35,0.88)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.5)",
} as React.CSSProperties

export default function DashboardPage() {
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
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#ADFF2F]"
            style={{ boxShadow: "0 0 8px #ADFF2F" }}
          />
          <span className="text-xs font-mono text-[#ADFF2F]">MCP Active</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map(({ icon: Icon, label, value, change, color, colorBg, colorBorder, alert, href }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
            style={{
              ...glass,
              ...(alert ? { border: `1px solid ${colorBorder}` } : {}),
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.5 }}
            />
            {/* Hover radial glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top left, ${colorBg}, transparent 65%)` }}
            />
            {/* Icon */}
            <div
              className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: colorBg, border: `1px solid ${colorBorder}` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            {/* Value */}
            <div className="relative text-[26px] font-bold tracking-tight text-[#E8EDF0] leading-none">{value}</div>
            <div className="relative mt-1 text-xs text-[#8B96A0]">{label}</div>
            {/* Change */}
            <div className="relative mt-3 flex items-center gap-1">
              <span className="text-[11px] font-mono" style={{ color: alert ? color : "#4B5563" }}>
                {change}
              </span>
              {alert && <ArrowUpRight className="h-3 w-3" style={{ color }} />}
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Activity feed */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl" style={glass}>
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "rgba(173,255,47,0.1)" }}>
                <Activity className="h-3.5 w-3.5 text-[#ADFF2F]" />
              </div>
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Recent activity</h2>
            </div>
            <Link href="/memories" className="text-xs font-mono text-[#ADFF2F] hover:underline transition-opacity hover:opacity-80">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {ACTIVITY.map(({ icon: Icon, text, sub, time, type }, i) => {
              const s = TYPE_STYLE[type]
              return (
                <div
                  key={i}
                  className="flex gap-3.5 px-5 py-3.5 transition-colors duration-150 hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#E8EDF0]">{text}</p>
                    <p className="mt-0.5 text-xs text-[#8B96A0] truncate">{sub}</p>
                  </div>
                  <span className="mt-0.5 shrink-0 text-[10px] font-mono text-[#4B5563]">{timeAgo(time)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Memory health */}
          <div className="overflow-hidden rounded-2xl" style={glass}>
            <div className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "rgba(173,255,47,0.1)" }}>
                <Zap className="h-3.5 w-3.5 text-[#ADFF2F]" />
              </div>
              <h2 className="text-sm font-semibold text-[#E8EDF0]">Memory health</h2>
            </div>
            <div className="space-y-4 p-5">
              {/* Bars */}
              {[
                { label: "Approved", value: 244, total: 247, color: "#ADFF2F", colorFade: "rgba(173,255,47,0.5)" },
                { label: "Pending",  value: 3,   total: 247, color: "#F472B6", colorFade: "rgba(244,114,182,0.5)" },
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
                  <Chip variant="mint" dot>decision · 89</Chip>
                  <Chip variant="blue" dot>arch · 67</Chip>
                  <Chip variant="red" dot>bug · 52</Chip>
                  <Chip variant="default" dot>note · 39</Chip>
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
              {QUICK_ACTIONS.map(({ label, tag, href, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-[rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
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
